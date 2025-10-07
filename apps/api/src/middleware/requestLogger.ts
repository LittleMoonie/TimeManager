import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  
  // Add request ID to headers
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  
  // Create request logger
  (req as any).log = logger.child({
    requestId,
    userId: (req as any).user?.id,
    organizationId: (req as any).user?.organizationId,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  // Log incoming request
  (req as any).log.info({
    method: req.method,
    url: req.url,
    headers: req.headers,
  }, 'Incoming request');
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    (req as any).log.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    }, 'Request completed');
  });
  
  next();
};
