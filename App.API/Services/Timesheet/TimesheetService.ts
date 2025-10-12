import { Service } from "typedi";
import { TimesheetRepository } from "@/Repositories/Timesheets/TimesheetRepository";
import { Timesheet, TimesheetStatus } from "@/Entities/Timesheets/Timesheet";
import { NotFoundError, UnprocessableEntityError } from "@/Errors/HttpErrors";
import { CreateTimesheetEntryDto } from "@/Dtos/Timesheet/TimesheetDto";
import { TimesheetEntryRepository } from "@/Repositories/Timesheets/TimesheetEntryRepository";
import { TimesheetHistoryService } from "@/Services/Logs/Timesheet/TimesheetHistoryService";

@Service()
export class TimesheetService {
  /**
   * @description Initializes the TimesheetService with the TimesheetRepository.
   * @param timesheetRepository The repository for Timesheet entities, injected by TypeDI.
   */
  constructor(private readonly timesheetRepository: TimesheetRepository, private readonly timesheetEntryRepository: TimesheetEntryRepository, private readonly timesheetHistoryService: TimesheetHistoryService) {}

  /**
   * @description Retrieves a timesheet by its unique identifier.
   * @param timesheetId The unique identifier of the timesheet.
   * @returns A Promise that resolves to the Timesheet entity.
   * @throws {NotFoundError} If the timesheet is not found.
   */
  public async getTimesheet(timesheetId: string): Promise<Timesheet> {
    const timesheet = await this.timesheetRepository.findById(timesheetId);
    if (!timesheet) {
      throw new NotFoundError("Timesheet not found");
    }
    return timesheet;
  }

  /**
   * @description Retrieves all timesheets for a specific user within a given company.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user.
   * @returns A Promise that resolves to an array of Timesheet entities.
   */
  public async getAllTimesheetsForUser(companyId: string, userId: string): Promise<Timesheet[]> {
    return this.timesheetRepository.findAllForUser(companyId, userId);
  }

  /**
   * @description Adds a new entry to an existing timesheet.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user who owns the timesheet.
   * @param timesheetId The unique identifier of the timesheet to add the entry to.
   * @param dto The CreateTimesheetEntryDto containing the details of the new timesheet entry.
   * @returns A Promise that resolves to the updated Timesheet entity with the new entry.
   * @throws {NotFoundError} If the timesheet is not found.
   */
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

    await this.timesheetHistoryService.recordEvent(companyId, {
      userId,
      targetType: "TimesheetEntry",
      targetId: newEntry.id,
      action: "created",
      metadata: { timesheetId },
    });

    return this.getTimesheet(timesheetId);
  }

  /**
   * @description Submits a timesheet for approval. Changes its status from DRAFT to SUBMITTED.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user submitting the timesheet.
   * @param timesheetId The unique identifier of the timesheet to submit.
   * @returns A Promise that resolves to the updated Timesheet entity.
   * @throws {NotFoundError} If the timesheet is not found.
   * @throws {UnprocessableEntityError} If the timesheet is not in DRAFT status.
   */
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

    await this.timesheetHistoryService.recordEvent(companyId, {
      userId,
      targetType: "Timesheet",
      targetId: timesheetId,
      action: "submitted",
    });

    return updated!;
  }

  /**
   * @description Approves a submitted timesheet. Changes its status from SUBMITTED to APPROVED.
   * @param companyId The unique identifier of the company.
   * @param approverId The unique identifier of the user approving the timesheet.
   * @param timesheetId The unique identifier of the timesheet to approve.
   * @returns A Promise that resolves to the updated Timesheet entity.
   * @throws {NotFoundError} If the timesheet is not found.
   * @throws {UnprocessableEntityError} If the timesheet is not in SUBMITTED status.
   */
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

    await this.timesheetHistoryService.recordEvent(companyId, {
      userId: timesheet.userId,
      targetType: "Timesheet",
      targetId: timesheetId,
      action: "approved",
      actorUserId: approverId,
    });

    return updated!;
  }

  /**
   * @description Rejects a submitted timesheet. Changes its status from SUBMITTED to REJECTED.
   * @param companyId The unique identifier of the company.
   * @param approverId The unique identifier of the user rejecting the timesheet.
   * @param timesheetId The unique identifier of the timesheet to reject.
   * @param reason The reason for rejecting the timesheet.
   * @returns A Promise that resolves to the updated Timesheet entity.
   * @throws {NotFoundError} If the timesheet is not found.
   * @throws {UnprocessableEntityError} If the timesheet is not in SUBMITTED status.
   */
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

    await this.timesheetHistoryService.recordEvent(companyId, {
      userId: timesheet.userId,
      targetType: "Timesheet",
      targetId: timesheetId,
      action: "rejected",
      actorUserId: approverId,
      reason,
    });

    return updated!;
  }

  /**
   * @description Soft deletes a timesheet by its unique identifier.
   * @param timesheetId The unique identifier of the timesheet to soft delete.
   * @returns A Promise that resolves when the soft deletion is complete.
   * @throws {NotFoundError} If the timesheet is not found.
   */
  public async softDeleteTimesheet(timesheetId: string): Promise<void> {
    const timesheet = await this.getTimesheet(timesheetId);
    await this.timesheetRepository.softDelete(timesheet.id);
  }

  /**
   * @description Permanently deletes a timesheet by its unique identifier from the database. This operation is irreversible.
   * @param timesheetId The unique identifier of the timesheet to hard delete.
   * @returns A Promise that resolves when the hard deletion is complete.
   * @throws {NotFoundError} If the timesheet is not found.
   */
  public async hardDeleteTimesheet(timesheetId: string): Promise<void> {
    const timesheet = await this.timesheetRepository.findById(timesheetId, true);
    if (!timesheet) {
      throw new NotFoundError("Timesheet not found.");
    }
    await this.timesheetRepository.delete(timesheet.id);
  }
}
