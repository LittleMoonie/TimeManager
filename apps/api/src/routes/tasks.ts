import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@ncy-8/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';

const router = Router();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  search: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  projectId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
});

const paramsSchema = z.object({
  id: z.string().uuid(),
});

// GET /api/v1/tasks
router.get('/', 
  authenticateToken, 
  validateQuery(querySchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { page, limit, search, status, priority, projectId, assigneeId } = req.query as any;
      const userId = req.user!.id;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
        project: {
          organization: {
            members: {
              some: {
                userId,
                deletedAt: null,
              },
            },
          },
        },
      };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (projectId) where.projectId = projectId;
      if (assigneeId) where.assigneeId = assigneeId;

      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          include: {
            project: {
              select: {
                id: true,
                name: true,
                organization: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.task.count({ where }),
      ]);

      res.json({
        data: tasks,
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

// GET /api/v1/tasks/:id
router.get('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const task = await prisma.task.findFirst({
        where: {
          id,
          deletedAt: null,
          project: {
            organization: {
              members: {
                some: {
                  userId,
                  deletedAt: null,
                },
              },
            },
          },
        },
        include: {
          project: {
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!task) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Task not found',
        });
      }

      res.json({ data: task });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/tasks
router.post('/', 
  authenticateToken, 
  validateBody(createTaskSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { title, description, status, priority, dueDate, assigneeId, metadata } = req.body;
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
          message: 'You must be a member of an organization to create tasks',
        });
      }

      // Get a project from the organization
      const project = await prisma.project.findFirst({
        where: {
          organizationId: membership.organizationId,
          deletedAt: null,
        },
      });

      if (!project) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'No projects found in your organization',
        });
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          status,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          assigneeId,
          metadata: metadata || {},
          projectId: project.id,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json({
        data: task,
        message: 'Task created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/tasks/:id
router.put('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  validateBody(updateTaskSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;

      // Check if user has access to the task
      const task = await prisma.task.findFirst({
        where: {
          id,
          deletedAt: null,
          project: {
            organization: {
              members: {
                some: {
                  userId,
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      if (!task) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Task not found',
        });
      }

      // Convert dueDate string to Date if provided
      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate);
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.json({
        data: updatedTask,
        message: 'Task updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/tasks/:id
router.delete('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Check if user has access to the task
      const task = await prisma.task.findFirst({
        where: {
          id,
          deletedAt: null,
          project: {
            organization: {
              members: {
                some: {
                  userId,
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      if (!task) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Task not found',
        });
      }

      // Soft delete task
      await prisma.task.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export { router as taskRoutes };
