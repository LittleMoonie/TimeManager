import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository, ILike } from "typeorm";
import User from "../../Entities/Users/User";
import { BaseRepository } from "../BaseRepository";

/**
 * UserRepository
 * - DI-safe (injects TypeORM Repository<User>)
 * - Company-scoped finders provided
 * - Keep admin/global methods in service layer control
 */
@Service()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User) repo: Repository<User>
  ) {
    super(User, repo);
  }

  /** Find a user by email in a company. */
  async findByEmailInCompany(email: string, companyId: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email, companyId },
      relations: ["role", "status"],
    });
  }

  /** Find all users in a company. */
  async findAllByCompanyId(companyId: string): Promise<User[]> {
    return this.repository.find({
      where: { companyId },
      relations: ["role", "status"],
    });
  }

  /** Find a user by id in a company. */
  async findByIdInCompany(userId: string, companyId: string, withDeleted = false): Promise<User | null> {
    return this.repository.findOne({
      where: { id: userId, companyId },
      withDeleted,
      relations: ["role", "status"],
    });
  }

  /** Hard delete a user from the database. */
  async hardDelete(userId: string): Promise<void> {
    await this.repository.delete(userId);
  }

  /**
   * Paginate users scoped to a company, with basic filters.
   */
  async findPaginatedByCompany(
    companyId: string,
    page: number,
    limit: number,
    opts?: { roleId?: string; statusId?: string; q?: string }
  ): Promise<{ data: User[]; total: number }> {
    const where: any = { companyId };

    if (opts?.roleId) where.roleId = opts.roleId;
    if (opts?.statusId) where.statusId = opts.statusId;

    // Basic "q" search across first/last/email if provided
    // Uses ILike for Postgres case-insensitive search
    const qb = this.repository.createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .leftJoinAndSelect("user.status", "status")
      .where("user.companyId = :companyId", { companyId });

    if (opts?.roleId) qb.andWhere("user.roleId = :roleId", { roleId: opts.roleId });
    if (opts?.statusId) qb.andWhere("user.statusId = :statusId", { statusId: opts.statusId });

    if (opts?.q) {
      qb.andWhere(
        "(user.email ILIKE :q OR user.firstName ILIKE :q OR user.lastName ILIKE :q)",
        { q: `%${opts.q}%` }
      );
    }

    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("user.createdAt", "DESC")
      .getManyAndCount();

    return { data: rows, total };
  }
}
