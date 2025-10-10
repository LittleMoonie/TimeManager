import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { getAuthUser } from '../utils/auth';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  let userId: string | undefined;
  let orgId: string | undefined;

  const authUser = getAuthUser(req);
  if (authUser) {
    userId = authUser.id;
    orgId = authUser.orgId;
  }

  // Attach metadata to the request object
  req.requestId = requestId;
  req.userId = userId;
  req.orgId = orgId;

  // Set default metadata for the logger
  const defaultMeta = { requestId, userId, orgId, ip: req.ip };

  // Log incoming request
  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`, {
    ...defaultMeta,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Log outgoing response
  const originalSend = res.send;
  res.send = function (body?: unknown): Response {
    logger.info(`Outgoing Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`, {
      ...defaultMeta,
      responseBody: body,
      statusCode: res.statusCode,
    });
    return originalSend.apply(res, [body]);
  };

  next();
};

