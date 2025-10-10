
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../server/database';
import User from '../models/user';

export async function expressAuthentication(
  request: Request,
  securityName: string,
  ): Promise<any> {
  if (securityName === 'jwt') {
    const token = request.headers.authorization?.replace('Bearer ', '') || request.body?.token;

    if (!token) {
      throw new Error('No token provided');
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET || '');
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: (decoded as any).id } });

      if (!user) {
        throw new Error('User not found');
      }

      // Attach the user object to the request for use in controllers
      (request as any).user = user;
      return user;

    } catch (error) {
      throw new Error('Authentication failed ' + error);
    }
  }

  throw new Error('Unknown security name');
}
