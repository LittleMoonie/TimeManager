import { Service } from 'typedi';
import { Repository } from 'typeorm';

import ActiveSession from '../../Entities/Users/ActiveSessions';
import User from '../../Entities/Users/User';
import { getInitializedDataSource } from '../../Server/Database';

/**
 * @description Repository for handling authentication-related database operations.
 * This includes managing User and ActiveSession entities for login, registration, and session management.
 */
@Service('AuthenticationRepository')
export class AuthenticationRepository {
  private get userRepo(): Repository<User> {
    return getInitializedDataSource().getRepository(User);
  }

  private get activeSessionRepo(): Repository<ActiveSession> {
    return getInitializedDataSource().getRepository(ActiveSession);
  }

  async findUserByEmailWithAuthRelations(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      relations: [
        'status',
        'company',
        'role',
        'role.rolePermissions',
        'role.rolePermissions.permission',
      ],
    });
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepo.save(user);
  }

  async findUserByIdWithBasicRelations(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: ['status', 'company', 'role'],
    });
  }

  async createAndSaveActiveSessionPartial(data: Partial<ActiveSession>): Promise<ActiveSession> {
    const entity = this.activeSessionRepo.create(data);
    return this.activeSessionRepo.save(entity);
  }
}
