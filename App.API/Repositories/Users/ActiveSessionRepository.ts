import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository, FindOneOptions } from "typeorm";

import ActiveSession from "@/Entities/Users/ActiveSessions";
import { BaseRepository } from "../BaseRepository";

/**
 * Repository for ActiveSession entities.
 */
@Service()
export class ActiveSessionRepository extends BaseRepository<ActiveSession> {
  constructor(
    @InjectRepository(ActiveSession)
    repo: Repository<ActiveSession>
  ) {
    super(ActiveSession, repo);
  }

  async findByTokenHashInCompany(
    companyId: string,
    tokenHash: string
  ): Promise<ActiveSession | null> {
    const options: FindOneOptions<ActiveSession> = {
      where: { companyId, tokenHash },
    };
    return this.repository.findOne(options);
  }

  /** Global lookup (admin/system only). */
  async findByTokenHash(tokenHash: string): Promise<ActiveSession | null> {
    return this.repository.findOne({ where: { tokenHash } });
  }

  async findAllForUser(
    companyId: string,
    userId: string
  ): Promise<ActiveSession[]> {
    return this.repository.find({
      where: { companyId, userId },
      order: { lastSeenAt: "DESC" },
    });
  }
}
