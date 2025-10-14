import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, ForbiddenError, InternalServerError } from '../Errors/HttpErrors';

// Define the shape of the JWT payload
type JwtPayload = {
  id: string;
  companyId: string;
  role: string;
};

// Define the shape of the user object attached to the request
export type AuthenticatedUser = {
  id: string;
  companyId: string;
  role: string;
};

// Extend Express's Request type to include the user property
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}

export async function expressAuthentication(
  request: Request,
  name: string,
  scopes?: string[],
): Promise<AuthenticatedUser> {
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

    if (scopes?.length && !scopes.includes(payload.role)) {
      throw new ForbiddenError('Forbidden: Insufficient scope');
    }

    const user: AuthenticatedUser = {
      id: payload.id,
      companyId: payload.companyId,
      role: payload.role,
    };

    request.user = user;
    return user;
  } catch (_error: unknown) {
    throw new AuthenticationError('Invalid or expired token ' + (_error as Error).message);
  }
}
