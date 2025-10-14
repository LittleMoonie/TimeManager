import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';

import ActiveSession from '../../Entities/Users/ActiveSessions';
import { NotFoundError } from '../../Errors/HttpErrors';
import { UserRepository } from '../../Repositories/Users/UserRepository';
import { getInitializedDataSource } from '../../Server/Database';

/**
 * @description Service layer for handling user data anonymization. This service provides functionality
 * to anonymize personal user information and hard delete associated sensitive data like active sessions.
 */
@Service()
export class AnonymizationService {
  /**
   * @description Initializes the AnonymizationService with necessary repositories.
   * @param userRepository The repository for User entities.
   * @param activeSessionRepository The TypeORM repository for ActiveSession entities.
   */
  constructor(@Inject('UserRepository') private readonly userRepository: UserRepository) {}

  private get activeSessionRepository(): Repository<ActiveSession> {
    return getInitializedDataSource().getRepository(ActiveSession);
  }

  /**
   * @description Anonymizes a user's personal data and hard deletes their active sessions.
   * This operation is typically performed for privacy compliance or data retention policies.
   * @param userId The unique identifier of the user to anonymize.
   * @param companyId The unique identifier of the company the user belongs to.
   * @returns A Promise that resolves when the anonymization process is complete.
   * @throws {NotFoundError} If the user is not found or does not belong to the specified company.
   */
  public async anonymizeUserData(userId: string, companyId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.companyId !== companyId) {
      throw new NotFoundError('User not found');
    }

    // Anonymize user's personal information
    user.firstName = 'Deleted';
    user.lastName = 'User';
    user.email = `deleted-${user.id}@gogotime.com`;
    user.phoneNumber = undefined;
    user.passwordHash = ''; // Invalidate password
    user.isAnonymized = true;

    await this.userRepository.update(user.id, user);

    // Hard delete related sensitive data
    await this.activeSessionRepository.delete({ userId: user.id });
  }
}
