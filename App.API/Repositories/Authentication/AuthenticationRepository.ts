import Container, { Service } from 'typedi';

import ActiveSession from '../../Entities/Users/ActiveSessions';
import User from '../../Entities/Users/User';
import { BaseRepository } from '../../Repositories/BaseRepository';
import { getInitializedDataSource } from '../../Server/Database';

/**
 * @description Repository for handling authentication-related database operations.
 * This includes managing User and ActiveSession entities for login, registration, and session management.
 */
@Service('AuthenticationRepository')
export class AuthenticationRepository extends BaseRepository<User> {
  constructor() {
    /**
     * @description Initializes the AuthenticationRepository with a TypeORM Repository instance for User.
     * @param repository The TypeORM Repository<User> injected by TypeDI.
     */
    super(User);
  }

  async findUserByEmailWithAuthRelations(email: string): Promise<User | null> {
    return this.repository.findOne({
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
    return this.repository.save(user);
  }

  async findUserByIdWithBasicRelations(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['status', 'company', 'role'],
    });
  }

  async createAndSaveActiveSessionPartial(data: Partial<ActiveSession>): Promise<ActiveSession> {
    const dataSource = getInitializedDataSource();
    const activeSessionRepo = dataSource.getRepository(ActiveSession);
    const entity = activeSessionRepo.create(data);
    return activeSessionRepo.save(entity);
  }
}

Container.set('AuthenticationRepository', new AuthenticationRepository());
