import { Inject, Service } from 'typedi';

import { ActionLog, ActionLogType } from '../../../Entities/Logs/Actions/ActionLog';
import { ActionLogRepository } from '../../../Repositories/Logs/Actions/ActionLogRepository';

export class ActionLogService {
  constructor(
    @Inject('ActionLogRepository')
    private readonly actionLogRepository: ActionLogRepository,
  ) {}

  public async log(
    companyId: string,
    actionType: ActionLogType,
    description: string,
    userId?: string,
    metadata?: object,
  ): Promise<void> {
    await this.actionLogRepository.save({
      companyId,
      userId,
      actionType,
      description,
      metadata,
    } as ActionLog);
  }

  public async getLogs(companyId: string): Promise<ActionLog[]> {
    return this.actionLogRepository.findAll();
  }
}
