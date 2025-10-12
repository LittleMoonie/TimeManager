import { Service } from "typedi";
import { TimesheetRepository } from "../../Repositories/Timesheets/TimesheetRepository";
import { TimesheetEntryRepository } from "../../Repositories/Timesheets/TimesheetEntryRepository";
import { TimesheetApprovalRepository } from "../../Repositories/Timesheets/TimesheetApprovalRepository";
import { TimesheetHistoryService } from "../Logs/Timesheet/TimesheetHistoryService";
import {
  Timesheet,
  TimesheetStatus,
} from "../../Entities/Timesheets/Timesheet";
import {
  NotFoundError,
  UnprocessableEntityError,
} from "../../Errors/HttpErrors";
import {
  CreateTimesheetDto,
  CreateTimesheetEntryDto,
} from "../../Dtos/Timesheet/TimesheetDto";
import { validate } from "class-validator";

@Service()
export class TimesheetService {
  constructor(
    private timesheetRepository: TimesheetRepository,
    private timesheetEntryRepository: TimesheetEntryRepository,
    private timesheetApprovalRepository: TimesheetApprovalRepository,
    private timesheetHistoryService: TimesheetHistoryService,
  ) {}

  public async createTimesheet(
    companyId: string,
    userId: string,
    createTimesheetDto: CreateTimesheetDto,
  ): Promise<Timesheet> {
    const errors = await validate(createTimesheetDto);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(", ")}`,
      );
    }

    const newTimesheet = await this.timesheetRepository.create({
      companyId,
      userId,
      ...createTimesheetDto,
    });

    await this.timesheetHistoryService.recordEvent(companyId, {
      userId,
      targetType: "Timesheet",
      targetId: newTimesheet.id,
      action: "created",
    });

    return newTimesheet;
  }

  public async getTimesheet(
    timesheetId: string,
  ): Promise<Timesheet> {
    const timesheet = await this.timesheetRepository.findById(timesheetId);
    if (!timesheet) {
      throw new NotFoundError("Timesheet not found");
    }
    return timesheet;
  }

  public async addTimesheetEntry(
    companyId: string,
    userId: string,
    timesheetId: string,
    createTimesheetEntryDto: CreateTimesheetEntryDto,
  ): Promise<Timesheet> {
    const timesheet = await this.getTimesheet(timesheetId);

    const newEntry = await this.timesheetEntryRepository.create({
      companyId,
      userId,
      timesheetId,
      ...createTimesheetEntryDto,
    });

    timesheet.totalMinutes += newEntry.durationMin;
    await this.timesheetRepository.update(timesheetId, {
      totalMinutes: timesheet.totalMinutes,
    });

    await this.timesheetHistoryService.recordEvent(companyId, {
      userId,
      targetType: "TimesheetEntry",
      targetId: newEntry.id,
      action: "created",
      metadata: { timesheetId },
    });

    return this.getTimesheet(timesheetId);
  }

  public async submitTimesheet(
    companyId: string,
    userId: string,
    timesheetId: string,
  ): Promise<Timesheet> {
    const timesheet = await this.getTimesheet(timesheetId);

    if (timesheet.status !== TimesheetStatus.DRAFT) {
      throw new UnprocessableEntityError("Timesheet is not in draft status");
    }

    const updatedTimesheet = await this.timesheetRepository.update(
      timesheetId,
      {
        status: TimesheetStatus.SUBMITTED,
        submittedAt: new Date(),
        submittedByUserId: userId,
      },
    );

    await this.timesheetHistoryService.recordEvent(companyId, {
      userId,
      targetType: "Timesheet",
      targetId: timesheetId,
      action: "submitted",
    });

    return updatedTimesheet!;
  }

  public async approveTimesheet(
    companyId: string,
    approverId: string,
    timesheetId: string,
  ): Promise<Timesheet> {
    const timesheet = await this.getTimesheet(timesheetId);

    if (timesheet.status !== TimesheetStatus.SUBMITTED) {
      throw new UnprocessableEntityError(
        "Timesheet is not in submitted status",
      );
    }

    const updatedTimesheet = await this.timesheetRepository.update(
      timesheetId,
      { status: TimesheetStatus.APPROVED, approvedAt: new Date(), approverId },
    );

    await this.timesheetHistoryService.recordEvent(companyId, {
      userId: timesheet.userId,
      targetType: "Timesheet",
      targetId: timesheetId,
      action: "approved",
      actorUserId: approverId,
    });

    return updatedTimesheet!;
  }

  public async rejectTimesheet(
    companyId: string,
    approverId: string,
    timesheetId: string,
    reason: string,
  ): Promise<Timesheet> {
    const timesheet = await this.getTimesheet(timesheetId);

    if (timesheet.status !== TimesheetStatus.SUBMITTED) {
      throw new UnprocessableEntityError(
        "Timesheet is not in submitted status",
      );
    }

    const updatedTimesheet = await this.timesheetRepository.update(
      timesheetId,
      { status: TimesheetStatus.REJECTED },
    );

    await this.timesheetHistoryService.recordEvent(companyId, {
      userId: timesheet.userId,
      targetType: "Timesheet",
      targetId: timesheetId,
      action: "rejected",
      reason,
      actorUserId: approverId,
    });

    return updatedTimesheet!;
  }
}
