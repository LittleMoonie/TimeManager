import { Router } from 'express';
import { register } from 'prom-client';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /metrics
router.get('/', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate metrics',
    });
  }
});

// GET /api/v1/metrics/dashboard
router.get('/dashboard', 
  authenticateToken, 
  requireRole(['ADMIN']),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      // This would typically fetch metrics from Prometheus or your metrics store
      const metrics = {
        users: {
          total: 0,
          active: 0,
          newThisMonth: 0,
        },
        organizations: {
          total: 0,
          active: 0,
        },
        projects: {
          total: 0,
          active: 0,
          completed: 0,
        },
        tasks: {
          total: 0,
          completed: 0,
          overdue: 0,
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.env.npm_package_version || '1.0.0',
        },
      };

      res.json({
        data: metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as metricsRoutes };
