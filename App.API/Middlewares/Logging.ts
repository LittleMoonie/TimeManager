import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import logger from "../Utils/Logger";

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = uuidv4();
  let userId: string | undefined;
  let companyId: string | undefined;

  const authUser = req.user;
  if (authUser) {
    userId = authUser.id;
    companyId = authUser.companyId;
  }

  // Attach metadata to the request object
  req.requestId = requestId;
  req.userId = userId;
  req.companyId = companyId;

  // Set default metadata for the logger
  const defaultMeta = { requestId, userId, companyId, ip: req.ip };

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
    logger.info(
      `Outgoing Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`,
      {
        ...defaultMeta,
        responseBody: body,
        statusCode: res.statusCode,
      },
    );
    return originalSend.apply(res, [body]);
  };

  next();
};
