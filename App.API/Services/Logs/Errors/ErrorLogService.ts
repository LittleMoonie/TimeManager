import { Inject, Service } from 'typedi';

import { ErrorLog, ErrorLogLevel } from '../../../Entities/Logs/Errors/ErrorLog';
import { ErrorLogRepository } from '../../../Repositories/Logs/Errors/ErrorLogRepository';

export class ErrorLogService {
  constructor(
    @Inject('ErrorLogRepository') private readonly errorLogRepository: ErrorLogRepository,
  ) {}

  public async log(
    companyId: string,
    level: ErrorLogLevel,
    message: string,
    userId?: string,
    stack?: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
    await this.errorLogRepository.save({
      companyId,
      userId,
      level,
      message,
      stack,
      metadata,
    } as ErrorLog);
  }

  public async getLogs(companyId: string): Promise<ErrorLog[]> {
    return this.errorLogRepository.findAll();
  }
}
