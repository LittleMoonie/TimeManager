import { ValidateError } from '@tsoa/runtime';
import { NextFunction, Request, Response } from 'express';

import { HttpError } from '../Errors/HttpErrors';
import ILogger from '../Utils/Logger';

export const errorHandler = (logger: typeof ILogger) => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ValidateError) {
      const details: string[] = Object.entries(err.fields).map(([field, value]) => {
        const parts = [] as string[];
        if (value?.message) parts.push(value.message);
        if (value?.value !== undefined) parts.push(`received ${JSON.stringify(value.value)}`);
        return `${field}${parts.length ? ` - ${parts.join(' ')}` : ''}`;
      });
      res.status(err.status || 422).json({
        message: 'Validation failed',
        details: 'Details: ' + details.join(', '),
      });
      logger.error('Validation failed', {
        message: err.message,
        stack: err.stack,
        fields: err.fields,
      });
      return;
    }

    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }

    logger.error(err.message, err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
  };
};
