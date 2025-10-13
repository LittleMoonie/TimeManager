import { Service } from "typedi";
import { TimesheetHistoryRepository } from "../../../Repositories/Timesheets/TimesheetHistoryRepository";
import { CreateTimesheetHistoryDto } from "../../../Dtos/Logs/Timesheet/TimesheetHistoryDto";

@Service()
export class TimesheetHistoryService {
  constructor(private timesheetHistoryRepository: TimesheetHistoryRepository) {}

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
    targetType:
      | "Timesheet"
      | "TimesheetEntry"
      | "TimesheetApproval"
      | "ActionCode",
    targetId: string,
  ) {
    return this.timesheetHistoryRepository.findAllForTarget(
      companyId,
      targetType,
      targetId,
    );
  }
}
