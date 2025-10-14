import { NextFunction, Request, Response } from 'express';

import { HttpError } from '../Errors/HttpErrors';
import ILogger from '../Utils/Logger';

export const errorHandler = (logger: typeof ILogger) => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else {
      logger.error(err.message, err.stack);
      res.status(500).json({ message: 'Internal Server Error' });
    }
    next();
    return;
  };
};
