import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@ncy-8/database';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number, and special character'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']),
  organizationId: z.string().uuid().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional(),
});

const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional(),
});

const paramsSchema = z.object({
  id: z.string().uuid(),
});

// GET /api/v1/users
router.get('/', 
  authenticateToken, 
  requireRole(['ADMIN', 'MANAGER']), 
  validateQuery(querySchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { page, limit, search, role, status } = req.query as any;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (role) where.role = role;
      if (status) where.status = status;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        data: users,
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

// GET /api/v1/users/:id
router.get('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Users can view their own profile, admins/managers can view others
      if (id !== userId && !['ADMIN', 'MANAGER'].includes(userRole)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only view your own profile',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id, deletedAt: null },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          organizationMembers: {
            where: { deletedAt: null },
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
        },
      });

      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/users
router.post('/', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  validateBody(createUserSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { email, password, name, role, organizationId } = req.body;
      
      // Hash password
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          role,
          status: 'ACTIVE',
        },
      });

      // Add to organization if provided
      if (organizationId) {
        await prisma.organizationMember.create({
          data: {
            organizationId,
            userId: user.id,
            role: 'MEMBER',
          },
        });
      }

      res.status(201).json({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        },
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/users/:id
router.put('/:id', 
  authenticateToken, 
  validateParams(paramsSchema),
  validateBody(updateUserSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const updateData = req.body;

      // Users can update their own profile (limited fields), admins can update others
      if (id !== userId && !['ADMIN'].includes(userRole)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update your own profile',
        });
      }

      // Non-admins can only update their name
      if (id !== userId || !['ADMIN'].includes(userRole)) {
        delete updateData.role;
        delete updateData.status;
      }

      const user = await prisma.user.update({
        where: { id, deletedAt: null },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          updatedAt: true,
        },
      });

      res.json({
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/users/:id
router.delete('/:id', 
  authenticateToken, 
  requireRole(['ADMIN']), 
  validateParams(paramsSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { id } = req.params;

      // Soft delete user
      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export { router as userRoutes };
