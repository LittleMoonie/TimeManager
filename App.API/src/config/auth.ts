import { Request } from 'express';
import ActiveSession from '../models/activeSession';
import { AppDataSource } from '../server/database';

/**
 * Authentication function for tsoa
 * Validates JWT tokens stored in active sessions
 */
export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === 'jwt') {
    const token = request.headers.authorization?.replace('Bearer ', '') || request.body?.token;
    
    if (!token) {
      throw new Error('No token provided');
    }

    try {
      const activeSessionRepository = AppDataSource.getRepository(ActiveSession);
      const session = await activeSessionRepository.findOne({ 
        where: { token },
        relations: ['user']
      });

      if (!session) {
        throw new Error('Invalid token');
      }

      return session.user;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  throw new Error('Unknown security name');
}
