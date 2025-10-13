import { Request } from 'express';
import User from '../Entities/Users/User';
import { AuthenticationService } from '../Services/AuthenticationService/AuthenticationService';
import { Container } from 'typedi';
import { AuthenticationError } from '../Errors/HttpErrors';

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes: string[] = [],
): Promise<User> {
  const token = request.cookies?.jwt || request.headers?.authorization?.split(' ')[1];

  if (!token) {
    throw new AuthenticationError('No token provided');
  }

  try {
    const authenticationService = Container.get(AuthenticationService);
    const user = await authenticationService.getCurrentUser(token);

    // Check scopes (roles)
    if (scopes.length > 0 && !scopes.includes(user.role.name)) {
      throw new AuthenticationError('Forbidden: Insufficient permissions');
    }

    // Attach the user object to the request for use in controllers
    (request as Request & { user: User }).user = user;
    return user;
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError(
      'Authentication failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
    );
  }
}
