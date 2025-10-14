import { Service } from 'typedi';
import { FindOneOptions } from 'typeorm';

import ActiveSession from '../../Entities/Users/ActiveSessions';
import { BaseRepository } from '../../Repositories/BaseRepository';

/**
 * @description Repository for managing ActiveSession entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying active sessions by token hash and for a specific user.
 */
@Service()
export class ActiveSessionRepository extends BaseRepository<ActiveSession> {
  constructor() {
    /**
     * @description Initializes the ActiveSessionRepository with a TypeORM Repository instance for ActiveSession.
     * @param repository The TypeORM Repository<ActiveSession> injected by TypeDI.
     */
    super(ActiveSession);
  }

  async getActiveSessionByUserId(companyId: string, userId: string): Promise<ActiveSession | null> {
    return this.repository.findOne({ where: { companyId, userId } });
  }

  /**
   * @description Finds an active session by its token hash within a specific company.
   * @param companyId The unique identifier of the company.
   * @param tokenHash The SHA-256 hash of the refresh token.
   * @returns A Promise that resolves to the ActiveSession entity or null if not found.
   */
  async getActiveSessionByTokenHashInCompany(
    companyId: string,
    tokenHash: string,
  ): Promise<ActiveSession | null> {
    const options: FindOneOptions<ActiveSession> = {
      where: { companyId, tokenHash },
    };
    return this.repository.findOne(options);
  }

  /**
   * @description Finds an active session by its token hash globally (without company scope).
   * This method is typically used for admin or system-level lookups.
   * @param tokenHash The SHA-256 hash of the refresh token.
   * @returns A Promise that resolves to the ActiveSession entity or null if not found.
   */
  async getActiveSessionByTokenHash(tokenHash: string): Promise<ActiveSession | null> {
    return this.repository.findOne({ where: { tokenHash } });
  }

  /**
   * @description Finds all active sessions for a specific user within a given company.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user.
   * @returns A Promise that resolves to an array of ActiveSession entities, ordered by last seen time.
   */
  async getAllActiveSessionsForUser(companyId: string, userId: string): Promise<ActiveSession[]> {
    return this.repository.find({
      where: { companyId, userId },
      order: { lastSeenAt: 'DESC' },
    });
  }
}
