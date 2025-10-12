import { Service } from "typedi";
import { TimesheetRepository } from "../../Repositories/Timesheets/TimesheetRepository";
import { TimesheetEntryRepository } from "../../Repositories/Timesheets/TimesheetEntryRepository";
import { TimesheetHistoryRepository } from "../../Repositories/Timesheets/TimesheetHistoryRepository";
import { Timesheet, TimesheetStatus } from "../../Entities/Timesheets/Timesheet";
import { NotFoundError, UnprocessableEntityError } from "../../Errors/HttpErrors";
import { CreateTimesheetDto, CreateTimesheetEntryDto } from "../../Dtos/Timesheet/TimesheetDto";
import { validate } from "class-validator";
import { WorkMode } from "../../Entities/Timesheets/TimesheetEntry";

@Service()
export class TimesheetService {
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly timesheetEntryRepository: TimesheetEntryRepository,
    private readonly historyRepository: TimesheetHistoryRepository,
  ) {}

  private async recordEvent(companyId: string, payload: {
    userId: string;
    targetType: "Timesheet" | "TimesheetEntry";
    targetId: string;
    action: "created" | "submitted" | "approved" | "rejected";
    actorUserId?: string;
    reason?: string;
    metadata?: Record<string, string>;
  }) {
    await this.historyRepository.create({ companyId, ...payload } as any);
  }

  public async createTimesheet(companyId: string, userId: string, dto: CreateTimesheetDto): Promise<Timesheet> {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(`Validation error: ${errors.map((e) => e.toString()).join(", ")}`);
    }

    const created = await this.timesheetRepository.create({ companyId, userId, ...dto });

    await this.recordEvent(companyId, {
      userId,
      targetType: "Timesheet",
      targetId: created.id,
      action: "created",
    });

    return created;
  }

  public async getTimesheet(timesheetId: string): Promise<Timesheet> {
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
    dto: CreateTimesheetEntryDto,
  ): Promise<Timesheet> {
    const timesheet = await this.getTimesheet(timesheetId);

    const newEntry = await this.timesheetEntryRepository.create({
      companyId,
      userId,
      timesheetId,
      ...dto,
    });

    const newTotal = (timesheet.totalMinutes ?? 0) + newEntry.durationMin;
    await this.timesheetRepository.update(timesheetId, { totalMinutes: newTotal });

    await this.recordEvent(companyId, {
      userId,
      targetType: "TimesheetEntry",
      targetId: newEntry.id,
      action: "created",
      metadata: { timesheetId },
    });

    return this.getTimesheet(timesheetId);
  }

  public async submitTimesheet(companyId: string, userId: string, timesheetId: string): Promise<Timesheet> {
    const timesheet = await this.getTimesheet(timesheetId);

    if (timesheet.status !== TimesheetStatus.DRAFT) {
      throw new UnprocessableEntityError("Timesheet is not in draft status");
    }

    const updated = await this.timesheetRepository.update(timesheetId, {
      status: TimesheetStatus.SUBMITTED,
      submittedAt: new Date(),
      submittedByUserId: userId,
    });

    await this.recordEvent(companyId, {
      userId,
      targetType: "Timesheet",
      targetId: timesheetId,
      action: "submitted",
    });

    return updated!;
  }

  public async approveTimesheet(companyId: string, approverId: string, timesheetId: string): Promise<Timesheet> {
    const timesheet = await this.getTimesheet(timesheetId);

    if (timesheet.status !== TimesheetStatus.SUBMITTED) {
      throw new UnprocessableEntityError("Timesheet is not in submitted status");
    }

    const updated = await this.timesheetRepository.update(timesheetId, {
      status: TimesheetStatus.APPROVED,
      approvedAt: new Date(),
      approverId,
    });

    await this.recordEvent(companyId, {
      userId: timesheet.userId,
      targetType: "Timesheet",
      targetId: timesheetId,
      action: "approved",
      actorUserId: approverId,
    });

    return updated!;
  }

  public async rejectTimesheet(
    companyId: string,
    approverId: string,
    timesheetId: string,
    reason: string,
  ): Promise<Timesheet> {
    const timesheet = await this.getTimesheet(timesheetId);

    if (timesheet.status !== TimesheetStatus.SUBMITTED) {
      throw new UnprocessableEntityError("Timesheet is not in submitted status");
    }

    const updated = await this.timesheetRepository.update(timesheetId, { status: TimesheetStatus.REJECTED });

    await this.recordEvent(companyId, {
      userId: timesheet.userId,
      targetType: "Timesheet",
      targetId: timesheetId,
      action: "rejected",
      actorUserId: approverId,
      reason,
    });

    return updated!;
  }
}
