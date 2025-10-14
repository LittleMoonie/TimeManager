import { Inject, Service } from 'typedi';

import { CreateSystemLogDto } from '../../../Dtos/Logs/System/SystemLogDto';
import { SystemLog } from '../../../Entities/Logs/System/SystemLog';
import { SystemLogRepository } from '../../../Repositories/Logs/System/SystemLogRepository';

export class SystemLogService {
  constructor(
    @Inject('SystemLogRepository') private readonly systemLogRepository: SystemLogRepository,
  ) {}

  public async log(companyId: string, createSystemLogDto: CreateSystemLogDto): Promise<void> {
    await this.systemLogRepository.save({
      companyId,
      ...createSystemLogDto,
    } as SystemLog);
  }

  public async getLogs(companyId: string): Promise<SystemLog[]> {
    return this.systemLogRepository.findAll();
  }
}
