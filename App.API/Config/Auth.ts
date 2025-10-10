
import { Request } from 'express';
import User from '../Entity/Users/User';
import { AuthenticationService } from '../Service/AuthenticationService/AuthenticationService';

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes: string[] = []
): Promise<User> {
  const token = request.cookies?.jwt;

  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const authenticationService = new AuthenticationService();
    const authResponse = await authenticationService.getCurrentUser(token);

    if (!authResponse.success || !authResponse.user) {
      throw new Error(authResponse.msg || 'Authentication failed');
    }

    const user = authResponse.user as User;

    // Check scopes (roles)
    if (scopes.length > 0 && !scopes.includes(user.role)) {
      throw new Error('Forbidden: Insufficient permissions');
    }

    // Attach the user object to the request for use in controllers
    (request as any).user = user;
    return user;
  } catch (error: unknown) {
    throw new Error('Authentication failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
