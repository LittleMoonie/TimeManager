import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@ncy-8/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';

const router = Router();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  settings: z.record(z.any()).optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  settings: z.record(z.any()).optional(),
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  organizationId: z.string().uuid().optional(),
});

const paramsSchema = z.object({
  id: z.string().uuid(),
});

// GET /api/v1/projects
router.get('/', 
  authenticateToken, 
  validateQuery(querySchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { page, limit, search, status, organizationId } = req.query as any;
      const userId = req.user!.id;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
        organization: {
          members: {
            some: {
              userId,
              deletedAt: null,
            },
          },
        },
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) where.status = status;
      if (organizationId) where.organizationId = organizationId;

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where,
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            settings: true,
            createdAt: true,
            updatedAt: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                tasks: {
                  where: { deletedAt: null },
                },
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.project.count({ where }),
      ]);

      res.json({
        data: projects,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/projects/:id
router.get('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const project = await prisma.project.findFirst({
        where: {
          id,
          deletedAt: null,
          organization: {
            members: {
              some: {
                userId,
                deletedAt: null,
              },
            },
          },
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tasks: {
            where: { deletedAt: null },
            include: {
              assignee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!project) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Project not found',
        });
      }

      res.json({ data: project });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/projects
router.post('/', 
  authenticateToken, 
  validateBody(createProjectSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { name, description, status, settings } = req.body;
      const userId = req.user!.id;

      // Get user's organization
      const membership = await prisma.organizationMember.findFirst({
        where: {
          userId,
          deletedAt: null,
        },
      });

      if (!membership) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'You must be a member of an organization to create projects',
        });
      }

      const project = await prisma.project.create({
        data: {
          name,
          description,
          status,
          settings: settings || {},
          organizationId: membership.organizationId,
        },
      });

      res.status(201).json({
        data: project,
        message: 'Project created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/projects/:id
router.put('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  validateBody(updateProjectSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;

      // Check if user has access to the project
      const project = await prisma.project.findFirst({
        where: {
          id,
          deletedAt: null,
          organization: {
            members: {
              some: {
                userId,
                deletedAt: null,
              },
            },
          },
        },
      });

      if (!project) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Project not found',
        });
      }

      const updatedProject = await prisma.project.update({
        where: { id },
        data: updateData,
      });

      res.json({
        data: updatedProject,
        message: 'Project updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/projects/:id
router.delete('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Check if user has admin access to the project's organization
      const project = await prisma.project.findFirst({
        where: {
          id,
          deletedAt: null,
          organization: {
            members: {
              some: {
                userId,
                deletedAt: null,
                role: {
                  in: ['OWNER', 'ADMIN'],
                },
              },
            },
          },
        },
      });

      if (!project) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Project not found or you do not have permission to delete it',
        });
      }

      // Soft delete project
      await prisma.project.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export { router as projectRoutes };
