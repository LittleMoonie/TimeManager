import { Service } from "typedi";
import ActiveSession from "@/Entities/Users/ActiveSessions";
import { NotFoundError } from "@/Errors/HttpErrors";
import { ActiveSessionRepository } from "@/Repositories/Users/ActiveSessionRepository";

/**
 * Service layer for managing ActiveSession lifecycle:
 * - creation on login
 * - last-seen ping updates
 * - revocation on logout or security events
 *
 * All public methods are company-scoped to enforce multi-tenant safety.
 */
@Service()
export class ActiveSessionService {
  constructor(
    private readonly activeSessionRepository: ActiveSessionRepository
  ) {}

  async createActiveSession(
    companyId: string,
    userId: string,
    tokenHash: string,
    ip?: string,
    userAgent?: string,
    deviceId?: string,
  ): Promise<ActiveSession> {
    const activeSession = await this.activeSessionRepository.create({
      companyId,
      userId,
      tokenHash,
      ip,
      userAgent,
      deviceId,
      lastSeenAt: new Date(),
    });

    return activeSession;
  }

  async getActiveSessionByTokenInCompany(
    companyId: string,
    tokenHash: string
  ): Promise<ActiveSession> {
    const activeSession =
      await this.activeSessionRepository.findByTokenHashInCompany(companyId, tokenHash);

    if (!activeSession) {
      throw new NotFoundError("Active session not found");
    }
    return activeSession;
  }

  async revokeActiveSession(
    companyId: string,
    tokenHash: string
  ): Promise<void> {
    const activeSession = await this.getActiveSessionByTokenInCompany(companyId, tokenHash);
    await this.activeSessionRepository.update(activeSession.id, {
      revokedAt: new Date(),
    });
  }

  async updateLastSeen(
    companyId: string,
    tokenHash: string
  ): Promise<void> {
    const activeSession = await this.getActiveSessionByTokenInCompany(companyId, tokenHash);
    await this.activeSessionRepository.update(activeSession.id, {
      lastSeenAt: new Date(),
    });
  }

  async getAllUserSessions(
    companyId: string,
    userId: string,
  ): Promise<ActiveSession[]> {
    return this.activeSessionRepository.findAllForUser(companyId, userId);
  }
}
