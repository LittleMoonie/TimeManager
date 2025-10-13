import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

import User from '../../Entities/Users/User';
import ActiveSession from '../../Entities/Users/ActiveSessions';

/**
 * @description Repository for handling authentication-related database operations.
 * This includes managing User and ActiveSession entities for login, registration, and session management.
 */
@Service()
export class AuthenticationRepository {
  /**
   * @description Initializes the AuthenticationRepository with injected TypeORM Repositories for User and ActiveSession.
   * @param userRepo The TypeORM Repository<User> instance.
   * @param activeSessionRepo The TypeORM Repository<ActiveSession> instance.
   */
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(ActiveSession)
    private readonly activeSessionRepo: Repository<ActiveSession>,
  ) {}

  /**
   * @description Finds a user by email, including all necessary relations for authentication and authorization checks.
   * @param email The email address of the user to find.
   * @returns A Promise that resolves to the User entity with relations, or null if not found.
   */
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

  /**
   * @description Persists a user entity to the database. Useful for updating user details like last login.
   * @param user The User entity to save.
   * @returns A Promise that resolves to the saved User entity.
   */
  async saveUser(user: User): Promise<User> {
    return this.userRepo.save(user);
  }

  /**
   * @description Finds a user by ID, including basic relations required for operations like refreshing user data.
   * @param id The unique identifier of the user.
   * @returns A Promise that resolves to the User entity with basic relations, or null if not found.
   */
  async findUserByIdWithBasicRelations(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: ['status', 'company', 'role'],
    });
  }

  /**
   * @description Creates and saves a partial ActiveSession record. This is used to persist token hashes and device metadata.
   * @param data A partial ActiveSession object containing the data to be saved.
   * @returns A Promise that resolves to the newly created ActiveSession entity.
   */
  async createAndSaveActiveSessionPartial(data: Partial<ActiveSession>): Promise<ActiveSession> {
    const entity = this.activeSessionRepo.create(data);
    return this.activeSessionRepo.save(entity);
  }
}
