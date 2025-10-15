import Container, { Service } from 'typedi';

import User from '../../Entities/Users/User';
import { BaseRepository } from '../../Repositories/BaseRepository';

/**
 * @description Repository for managing User entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying users.
 */
@Service('UserRepository')
export class UserRepository extends BaseRepository<User> {
  /**
   * @description Initializes the UserRepository.
   */
  constructor() {
    super(User);
  }

  // #region Find Methods
  /**
   * @description Finds a single user by their email address within a specific company.
   * @param {string} email The email address of the user to find.
   * @returns {Promise<User | null>} The User entity or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      relations: ['role', 'status'],
    });
  }

  /**
   * @description Finds all users belonging to a specific company.
   * @param {string} companyId The unique identifier of the company.
   * @returns {Promise<User[]>} An array of User entities.
   */
  async findAllByCompanyId(companyId: string): Promise<User[]> {
    return this.repository.find({
      where: { companyId },
      relations: ['role', 'status'],
    });
  }

  /**
   * @description Finds a single user by their ID within a specific company.
   * @param {string} userId The unique identifier of the user.
   * @param {string} companyId The unique identifier of the company.
   * @param {boolean} [withDeleted=false] Optional: Whether to include soft-deleted records in the search.
   * @returns {Promise<User | null>} The User entity or null if not found.
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
   * @description Retrieves a paginated list of users scoped to a specific company, with optional filters.
   * @param {string} companyId The unique identifier of the company.
   * @param {number} page The page number to retrieve (1-based).
   * @param {number} limit The maximum number of records per page.
   * @param {object} [opts] Optional: An object containing additional filters.
   * @param {string} [opts.roleId] Optional: Filter users by their role ID.
   * @param {string} [opts.statusId] Optional: Filter users by their status ID.
   * @param {string} [opts.q] Optional: A search query string to filter by email, first name, or last name (case-insensitive).
   * @returns {Promise<{ data: User[]; total: number }>} An object containing the paginated user data and the total count.
   */
  async findPaginatedByCompany(
    companyId: string,
    page: number,
    limit: number,
    opts?: { roleId?: string; statusId?: string; q?: string },
  ): Promise<{ data: User[]; total: number }> {
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
  // #endregion

  // #region Anonymization
  /**
   * @description Anonymizes a user's data, effectively deleting them without removing the record.
   * This is a permanent action.
   * @param {string} userId The ID of the user to anonymize.
   * @returns {Promise<void>} A Promise that resolves when the user has been anonymized.
   */
  async anonymize(userId: string): Promise<void> {
    const now = new Date();
    const anonymizedData = {
      email: `deleted-${userId}-${now.getTime()}@example.com`,
      firstName: 'Deleted',
      lastName: 'User',
      passwordHash: 'anonymized',
      phoneNumber: undefined,
      mustChangePasswordAtNextLogin: true,
    };
    await this.update(userId, anonymizedData);
    await this.softDelete(userId); // Also soft-delete to hide from regular queries
  }
  // #endregion
}

Container.set('UserRepository', new UserRepository());
