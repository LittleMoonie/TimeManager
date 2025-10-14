import { Inject, Service } from 'typedi';
import { UserActivityLog } from '../../../Entities/Logs/Users/UserActivityLog';
import { CreateUserActivityLogDto } from '../../../Dtos/Logs/Users/UserActivityLogDto';
import { UserActivityLogRepository } from '../../../Repositories/Logs/Users/UserActivityLogRepository';

export class UserActivityLogService {
  constructor(@Inject("UserActivityLogRepository") private readonly userActivityLogRepository: UserActivityLogRepository) {}

  public async log(
    companyId: string,
    createUserActivityLogDto: CreateUserActivityLogDto,
  ): Promise<void> {
    await this.userActivityLogRepository.save({
      companyId,
      ...createUserActivityLogDto,
    } as UserActivityLog);
  }

  public async getLogs(companyId: string): Promise<UserActivityLog[]> {
    return this.userActivityLogRepository.findAll();
  }
}
