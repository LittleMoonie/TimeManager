import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";

import { BaseRepository } from "../BaseRepository";
import { UserStatus } from "../../Entities/Users/UserStatus";

/**
 * Repository for UserStatus entities.
 *
 * Notes:
 * - Uses DI to receive a TypeORM Repository<UserStatus>, then passes it to BaseRepository.
 * - Exposes convenience finders while keeping BaseRepository's CRUD & soft-delete utilities.
 */
@Service()
export class UserStatusRepository extends BaseRepository<UserStatus> {
  constructor(
    @InjectRepository(UserStatus)
    repo: Repository<UserStatus>
  ) {
    super(UserStatus, repo);
  }

  /**
   * Find a UserStatus by its machine-readable code (e.g., 'active', 'suspended').
   * @param code The unique code of the status.
   * @returns The matching UserStatus or null if not found.
   */
  async findByCode(code: string): Promise<UserStatus | null> {
    return this.repository.findOne({ where: { code } });
  }

  async hardDeleteUserStatus(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
