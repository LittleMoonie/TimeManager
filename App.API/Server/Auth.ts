import { Request } from 'express';
import jwt from 'jsonwebtoken';

import User from '../Entities/Users/User';
import { AuthenticationError, ForbiddenError, InternalServerError } from '../Errors/HttpErrors';

import { AppDataSource } from './Database';

// Define the shape of the JWT payload
type JwtPayload = {
  id: string;
  companyId: string;
  role: string;
};

// Define the shape of the user object attached to the request
export async function expressAuthentication(
  request: Request,
  name: string,
  scopes?: string[],
): Promise<User> {
  if (name !== 'jwt') {
    throw new InternalServerError('Unsupported security scheme');
  }

  let token = request.headers.authorization;
  if (token?.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  if (!token) {
    token = request.cookies?.jwt;
  }

  if (!token) {
    throw new AuthenticationError('No token provided');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: payload.id },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (scopes?.length) {
      const roleName = user.role?.name ?? payload.role;
      if (!roleName || !scopes.includes(roleName)) {
        throw new ForbiddenError('Forbidden: Insufficient scope');
      }
    }

    request.user = user;
    return user;
  } catch (_error: unknown) {
    throw new AuthenticationError('Invalid or expired token ' + (_error as Error).message);
  }
}
