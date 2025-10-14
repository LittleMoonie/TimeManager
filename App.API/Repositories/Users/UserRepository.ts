import { Service } from 'typedi';

import User from '../../Entities/Users/User';
import { BaseRepository } from '../../Repositories/BaseRepository';

/**
 * @description Repository for managing User entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying users within a company scope.
 */
@Service('UserRepository')
export class UserRepository extends BaseRepository<User> {
  /**
   * @description Initializes the UserRepository with a TypeORM Repository instance for User.
   * @param repo The TypeORM Repository<User> injected by TypeDI.
   */
  constructor() {
    super(User);
  }

  /**
   * @description Finds a single user by their email address within a specific company.
   * Includes related role and status information.
   * @param email The email address of the user to find.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to the User entity or null if not found.
   */
  async findByEmailInCompany(email: string, companyId: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email, companyId },
      relations: ['role', 'status'],
    });
  }
  /**
   * @description Finds all users belonging to a specific company.
   * Includes related role and status information.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to an array of User entities.
   */
  async findAllByCompanyId(companyId: string): Promise<User[]> {
    return this.repository.find({
      where: { companyId },
      relations: ['role', 'status'],
    });
  }

  /**
   * @description Finds a single user by their ID within a specific company.
   * @param userId The unique identifier of the user.
   * @param companyId The unique identifier of the company.
   * @param withDeleted Optional: Whether to include soft-deleted records in the search. Defaults to false.
   * @returns A Promise that resolves to the User entity or null if not found.
   */
  async findByIdInCompany(
    userId: string,
    companyId: string,
    withDeleted = false,
  ): Promise<User | null> {
    return this.repository.findOne({
      where: { id: userId, companyId },
      withDeleted,
      relations: ['role', 'status', 'company'],
    });
  }

  /**
   * @description Permanently deletes a user from the database by their ID. This operation is irreversible.
   * @param userId The unique identifier of the user to hard delete.
   * @returns A Promise that resolves when the deletion is complete.
   */
  async hardDelete(userId: string): Promise<void> {
    await this.repository.delete(userId);
  }

  /**
   * @description Retrieves a paginated list of users scoped to a specific company, with optional filters.
   * @param companyId The unique identifier of the company.
   * @param page The page number to retrieve (1-based).
   * @param limit The maximum number of records per page.
   * @param opts Optional: An object containing additional filters such as roleId, statusId, or a general query string (q).
   * @param opts.roleId Optional: Filter users by their role ID.
   * @param opts.statusId Optional: Filter users by their status ID.
   * @param opts.q Optional: A search query string to filter by email, first name, or last name (case-insensitive).
   * @returns A Promise that resolves to an object containing the paginated user data and the total count.
   */
  async findPaginatedByCompany(
    companyId: string,
    page: number,
    limit: number,
    opts?: { roleId?: string; statusId?: string; q?: string },
  ): Promise<{ data: User[]; total: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { companyId };

    if (opts?.roleId) where.roleId = opts.roleId;
    if (opts?.statusId) where.statusId = opts.statusId;

    // Basic "q" search across first/last/email if provided
    // Uses ILike for Postgres case-insensitive search
    const qb = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.status', 'status')
      .where('user.companyId = :companyId', { companyId });

    if (opts?.roleId) qb.andWhere('user.roleId = :roleId', { roleId: opts.roleId });
    if (opts?.statusId) qb.andWhere('user.statusId = :statusId', { statusId: opts.statusId });

    if (opts?.q) {
      qb.andWhere('(user.email ILIKE :q OR user.firstName ILIKE :q OR user.lastName ILIKE :q)', {
        q: `%${opts.q}%`,
      });
    }

    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return { data: rows, total };
  }
}
