import ActiveSession from "../../Entities/Users/ActiveSessions";
import { NotFoundError } from "../../Errors/HttpErrors";
import { ActiveSessionRepository } from "../../Repositories/Users/ActiveSessionRepository";

export class ActiveSessionService {
  private activeSessionRepository = new ActiveSessionRepository();

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

  async getActiveSessionByToken(tokenHash: string): Promise<ActiveSession> {
    const activeSession =
      await this.activeSessionRepository.findByTokenHash(tokenHash);
    if (!activeSession) {
      throw new NotFoundError("Active session not found");
    }
    return activeSession;
  }

  async revokeActiveSession(tokenHash: string): Promise<void> {
    const activeSession = await this.getActiveSessionByToken(tokenHash);
    await this.activeSessionRepository.update(activeSession.id, {
      revokedAt: new Date(),
    });
  }

  async updateLastSeen(tokenHash: string): Promise<void> {
    const activeSession = await this.getActiveSessionByToken(tokenHash);
    await this.activeSessionRepository.update(activeSession.id, {
      lastSeenAt: new Date(),
    });
  }

  async getAllUserSessions(
    companyId: string,
    userId: string,
  ): Promise<ActiveSession[]> {
    return this.activeSessionRepository.findAll(companyId, userId);
  }
}
