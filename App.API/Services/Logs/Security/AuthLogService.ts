import { Inject, Service } from 'typedi';

import { AuthLog, AuthLogAction } from '../../../Entities/Logs/Security/AuthLog';
import { AuthLogRepository } from '../../../Repositories/Logs/Security/AuthLogRepository';

export class AuthLogService {
  constructor(@Inject('AuthLogRepository') private readonly authLogRepository: AuthLogRepository) {}

  public async log(
    companyId: string,
    action: AuthLogAction,
    userId?: string,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
    await this.authLogRepository.save({
      companyId,
      userId,
      action,
      ip,
      userAgent,
      metadata,
    } as AuthLog);
  }

  public async getLogs(companyId: string): Promise<AuthLog[]> {
    return this.authLogRepository.findAll();
  }
}
