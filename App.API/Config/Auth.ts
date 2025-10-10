
import { Request } from 'express';
import { AppDataSource } from '../Server/Database';
import User from '../Entity/Users/User';
import { getAuthUser } from '../Utils/Auth';

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes: string[] = []
): Promise<User> {
  const authUser = getAuthUser(request);

  if (!authUser) {
    throw new Error('No token provided or authentication failed');
  }

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: authUser.id } });

    if (!user) {
      throw new Error('User not found');
    }

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
