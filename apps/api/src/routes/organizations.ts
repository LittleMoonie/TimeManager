import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@ncy-8/database';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';

const router = Router();

// Validation schemas
const createOrgSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  settings: z.record(z.any()).optional(),
});

const updateOrgSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  settings: z.record(z.any()).optional(),
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  search: z.string().optional(),
});

const paramsSchema = z.object({
  id: z.string().uuid(),
});

// GET /api/v1/organizations
router.get('/', 
  authenticateToken, 
  validateQuery(querySchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { page, limit, search } = req.query as any;
      const userId = req.user!.id;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
        members: {
          some: {
            userId,
            deletedAt: null,
          },
        },
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [organizations, total] = await Promise.all([
        prisma.organization.findMany({
          where,
          select: {
            id: true,
            name: true,
            slug: true,
            settings: true,
            createdAt: true,
            updatedAt: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                members: {
                  where: { deletedAt: null },
                },
                projects: {
                  where: { deletedAt: null },
                },
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.organization.count({ where }),
      ]);

      res.json({
        data: organizations,
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

// GET /api/v1/organizations/:id
router.get('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const organization = await prisma.organization.findFirst({
        where: {
          id,
          deletedAt: null,
          members: {
            some: {
              userId,
              deletedAt: null,
            },
          },
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          members: {
            where: { deletedAt: null },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          teams: {
            where: { deletedAt: null },
            include: {
              _count: {
                select: {
                  members: {
                    where: { deletedAt: null },
                  },
                },
              },
            },
          },
          projects: {
            where: { deletedAt: null },
            select: {
              id: true,
              name: true,
              status: true,
              createdAt: true,
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!organization) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Organization not found',
        });
      }

      res.json({ data: organization });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/organizations
router.post('/', 
  authenticateToken, 
  validateBody(createOrgSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { name, slug, settings } = req.body;
      const userId = req.user!.id;

      const organization = await prisma.organization.create({
        data: {
          name,
          slug,
          ownerId: userId,
          settings: settings || {},
        },
      });

      // Add creator as owner member
      await prisma.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId,
          role: 'OWNER',
        },
      });

      res.status(201).json({
        data: organization,
        message: 'Organization created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/organizations/:id
router.put('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  validateBody(updateOrgSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;

      // Check if user is owner or admin of the organization
      const membership = await prisma.organizationMember.findFirst({
        where: {
          organizationId: id,
          userId,
          deletedAt: null,
          role: {
            in: ['OWNER', 'ADMIN'],
          },
        },
      });

      if (!membership) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to update this organization',
        });
      }

      const organization = await prisma.organization.update({
        where: { id, deletedAt: null },
        data: updateData,
      });

      res.json({
        data: organization,
        message: 'Organization updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/organizations/:id
router.delete('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Check if user is owner of the organization
      const membership = await prisma.organizationMember.findFirst({
        where: {
          organizationId: id,
          userId,
          deletedAt: null,
          role: 'OWNER',
        },
      });

      if (!membership) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only the organization owner can delete the organization',
        });
      }

      // Soft delete organization
      await prisma.organization.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export { router as organizationRoutes };
