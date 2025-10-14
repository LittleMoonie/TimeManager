import { Inject, Service } from 'typedi';

import { DataLog, DataLogAction } from '../../../Entities/Logs/Data/DataLog';
import { DataLogRepository } from '../../../Repositories/Logs/Data/DataLogRepository';

export class DataLogService {
  constructor(@Inject('DataLogRepository') private readonly dataLogRepository: DataLogRepository) {}

  public async log(
    companyId: string,
    action: DataLogAction,
    entityType: string,
    entityId: string,
    userId?: string,
    oldValue?: Record<string, string>,
    newValue?: Record<string, string>,
    description?: string,
  ): Promise<void> {
    await this.dataLogRepository.save({
      companyId,
      userId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      description,
    } as DataLog);
  }

  public async getLogs(companyId: string): Promise<DataLog[]> {
    return this.dataLogRepository.findAll();
  }
}
