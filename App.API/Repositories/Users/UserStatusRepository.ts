import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';
import { BaseRepository } from '../BaseRepository';
import { UserStatus } from '../../Entities/Users/UserStatus';

/**
 * @description Repository for UserStatus entities, extending BaseRepository for common CRUD operations.
 * It provides specific methods for querying user statuses, such as finding by code.
 */

export class UserStatusRepository extends BaseRepository<UserStatus> {
  /**
   * @description Initializes the UserStatusRepository with a TypeORM Repository instance for UserStatus.
   * @param repo The TypeORM Repository<UserStatus> injected by TypeDI.
   */
  constructor(
    @InjectRepository(UserStatus)
    repo: Repository<UserStatus>,
  ) {
    super(UserStatus, repo);
  }

  /**
   * @description Finds a UserStatus entity by its machine-readable code.
   * @param code The unique code of the user status (e.g., 'ACTIVE', 'SUSPENDED').
   * @returns A Promise that resolves to the matching UserStatus entity or null if not found.
   */
  async findByCode(code: string): Promise<UserStatus | null> {
    return this.repository.findOne({ where: { code } });
  }

  /**
   * @description Permanently deletes a UserStatus entity by its ID from the database.
   * This operation is irreversible.
   * @param id The unique identifier of the UserStatus to hard delete.
   * @returns A Promise that resolves when the deletion is complete.
   * @throws {InternalServerError} If the delete operation fails.
   */
  async hardDeleteUserStatus(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
