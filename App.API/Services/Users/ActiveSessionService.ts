import { Service } from "typedi";
import ActiveSession from "../../Entities/Users/ActiveSessions";
import { NotFoundError } from "../../Errors/HttpErrors";
import { ActiveSessionRepository } from "../../Repositories/Users/ActiveSessionRepository";

/**
 * @description Service layer for managing the lifecycle of ActiveSession entities. This includes
 * creation upon login, updating last-seen timestamps, and revocation upon logout or security events.
 * All public methods are designed to be company-scoped to enforce multi-tenant safety.
 */
@Service()
export class ActiveSessionService {
  /**
   * @description Initializes the ActiveSessionService with the ActiveSessionRepository.
   * @param activeSessionRepository The repository for ActiveSession entities, injected by TypeDI.
   */
  constructor(
    private readonly activeSessionRepository: ActiveSessionRepository,
  ) {}

  /**
   * @description Creates a new active session record upon successful user login.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user.
   * @param tokenHash The SHA-256 hash of the refresh token.
   * @param ip Optional: The IP address from which the session originated.
   * @param userAgent Optional: The user agent string of the client.
   * @param deviceId Optional: A unique identifier for the device.
   * @returns A Promise that resolves to the newly created ActiveSession entity.
   */
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

  /**
   * @description Retrieves an active session by its token hash within a specific company scope.
   * @param companyId The unique identifier of the company.
   * @param tokenHash The SHA-256 hash of the refresh token.
   * @returns A Promise that resolves to the ActiveSession entity.
   * @throws {NotFoundError} If no active session is found for the given token hash and company ID.
   */
  async getActiveSessionByTokenInCompany(
    companyId: string,
    tokenHash: string,
  ): Promise<ActiveSession> {
    const activeSession =
      await this.activeSessionRepository.findByTokenHashInCompany(
        companyId,
        tokenHash,
      );

    if (!activeSession) {
      throw new NotFoundError("Active session not found");
    }
    return activeSession;
  }

  /**
   * @description Revokes an active session, typically during user logout or due to security events.
   * This marks the session as revoked by setting the `revokedAt` timestamp.
   * @param companyId The unique identifier of the company.
   * @param tokenHash The SHA-256 hash of the refresh token associated with the session to revoke.
   * @returns A Promise that resolves when the session has been revoked.
   * @throws {NotFoundError} If the active session is not found.
   */
  async revokeActiveSession(
    companyId: string,
    tokenHash: string,
  ): Promise<void> {
    const activeSession = await this.getActiveSessionByTokenInCompany(
      companyId,
      tokenHash,
    );
    await this.activeSessionRepository.update(activeSession.id, {
      revokedAt: new Date(),
    });
  }

  /**
   * @description Updates the `lastSeenAt` timestamp for an active session, indicating recent activity.
   * @param companyId The unique identifier of the company.
   * @param tokenHash The SHA-256 hash of the refresh token associated with the session.
   * @returns A Promise that resolves when the `lastSeenAt` timestamp has been updated.
   * @throws {NotFoundError} If the active session is not found.
   */
  async updateLastSeen(companyId: string, tokenHash: string): Promise<void> {
    const activeSession = await this.getActiveSessionByTokenInCompany(
      companyId,
      tokenHash,
    );
    await this.activeSessionRepository.update(activeSession.id, {
      lastSeenAt: new Date(),
    });
  }

  /**
   * @description Retrieves all active sessions for a specific user within a given company.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user.
   * @returns A Promise that resolves to an array of ActiveSession entities.
   */
  async getAllUserSessions(
    companyId: string,
    userId: string,
  ): Promise<ActiveSession[]> {
    return this.activeSessionRepository.findAllForUser(companyId, userId);
  }
}
