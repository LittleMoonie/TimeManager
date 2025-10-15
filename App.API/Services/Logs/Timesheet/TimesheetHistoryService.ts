import { Inject, Service } from 'typedi';

import { CreateTimesheetHistoryDto } from '../../../Dtos/Logs/Timesheet/TimesheetHistoryDto';
import { TimesheetHistoryRepository } from '../../../Repositories/Timesheets/TimesheetHistoryRepository';

@Service()
export class TimesheetHistoryService {
  constructor(
    @Inject('TimesheetHistoryRepository')
    private readonly timesheetHistoryRepository: TimesheetHistoryRepository,
  ) {}

  public async recordEvent(
    companyId: string,
    createTimesheetHistoryDto: CreateTimesheetHistoryDto,
  ): Promise<void> {
    await this.timesheetHistoryRepository.create({
      companyId,
      userId: createTimesheetHistoryDto.userId,
      targetId: createTimesheetHistoryDto.targetId,
      action: createTimesheetHistoryDto.action,
      diff: createTimesheetHistoryDto.diff,
      metadata: createTimesheetHistoryDto.metadata,
      reason: createTimesheetHistoryDto.reason,
    });
  }

  public async getHistoryForTarget(
    companyId: string,
    targetType: 'Timesheet' | 'TimesheetEntry' | 'TimesheetApproval' | 'ActionCode',
    targetId: string,
  ) {
    return this.timesheetHistoryRepository.findAllForTarget(companyId, targetType, targetId);
  }
}
