import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@ncy-8/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';

const router = Router();

// Validation schemas
const createNotificationSchema = z.object({
  type: z.enum(['INVITE', 'SYSTEM_ALERT', 'TASK_ASSIGNED', 'TASK_COMPLETED', 'PROJECT_UPDATE', 'ORGANIZATION_UPDATE']),
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  metadata: z.record(z.any()).optional(),
});

const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  read: z.string().transform(val => val === 'true').optional(),
  type: z.enum(['INVITE', 'SYSTEM_ALERT', 'TASK_ASSIGNED', 'TASK_COMPLETED', 'PROJECT_UPDATE', 'ORGANIZATION_UPDATE']).optional(),
});

const paramsSchema = z.object({
  id: z.string().uuid(),
});

// GET /api/v1/notifications
router.get('/', 
  authenticateToken, 
  validateQuery(querySchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { page, limit, read, type } = req.query as any;
      const userId = req.user!.id;
      const skip = (page - 1) * limit;

      const where: any = {
        userId,
        deletedAt: null,
      };

      if (read !== undefined) where.read = read;
      if (type) where.type = type;

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          select: {
            id: true,
            type: true,
            message: true,
            metadata: true,
            read: true,
            createdAt: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.notification.count({ where }),
      ]);

      res.json({
        data: notifications,
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

// GET /api/v1/notifications/:id
router.get('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId,
          deletedAt: null,
        },
      });

      if (!notification) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Notification not found',
        });
      }

      res.json({ data: notification });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/notifications
router.post('/', 
  authenticateToken, 
  validateBody(createNotificationSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { type, message, metadata } = req.body;
      const userId = req.user!.id;

      const notification = await prisma.notification.create({
        data: {
          type,
          message,
          metadata: metadata || {},
          userId,
        },
      });

      res.status(201).json({
        data: notification,
        message: 'Notification created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/notifications/:id
router.put('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  validateBody(updateNotificationSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;

      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId,
          deletedAt: null,
        },
      });

      if (!notification) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Notification not found',
        });
      }

      const updatedNotification = await prisma.notification.update({
        where: { id },
        data: updateData,
      });

      res.json({
        data: updatedNotification,
        message: 'Notification updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/notifications/:id
router.delete('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId,
          deletedAt: null,
        },
      });

      if (!notification) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Notification not found',
        });
      }

      // Soft delete notification
      await prisma.notification.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/notifications/mark-all-read
router.patch('/mark-all-read', 
  authenticateToken, 
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user!.id;

      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
          deletedAt: null,
        },
        data: {
          read: true,
        },
      });

      res.json({
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as notificationRoutes };
