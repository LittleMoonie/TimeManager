import { NextFunction, Request, Response } from 'express';

import ActiveSession from '../Entities/Users/ActiveSessions';
import { AppDataSource } from '../Server/Database';
import { FindOptionsWhere } from 'typeorm';

export const checkToken = (req: Request, res: Response, next: NextFunction) => {
  const token = String(req.headers.authorization || req.body.token);
  const activeSessionRepository = AppDataSource.getRepository(ActiveSession);

  activeSessionRepository
    .find({
      where: {
        token: token as unknown as never,
      } as FindOptionsWhere<ActiveSession>, // explicit cast to allow unknown token prop for dynamic query
    })
    .then((session: ActiveSession[]) => {
      if (session.length === 1) {
        return next();
      }
      return res.json({ success: false, msg: 'User is not logged on' });
    })
    .catch(() => {
      return res.json({ success: false, msg: 'Authentication error' });
    });
};
