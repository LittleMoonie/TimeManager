import { validate } from 'class-validator';
import { Inject, Service } from 'typedi';

import {
  CreateTimesheetEntryDto,
  UpdateTimesheetEntryDto,
} from '../../Dtos/Timesheet/TimesheetDto';
import { TimesheetEntry, TimesheetEntryStatus } from '../../Entities/Timesheets/TimesheetEntry';
import { NotFoundError } from '../../Errors/HttpErrors';
import { UnprocessableEntityError } from '../../Errors/HttpErrors';
import { TimesheetEntryRepository } from '../../Repositories/Timesheets/TimesheetEntryRepository';

/**
 * @description Service layer for managing TimesheetEntry entities. This service provides business logic
 * for creating, retrieving, updating, and deleting timesheet entries.
 */
@Service()
export class TimesheetEntryService {
  /**
   * @description Initializes the TimesheetEntryService with the TimesheetEntryRepository.
   * @param timesheetEntryRepository The repository for TimesheetEntry entities, injected by TypeDI.
   */
  constructor(
    @Inject('TimesheetEntryRepository')
    private readonly timesheetEntryRepository: TimesheetEntryRepository,
  ) {}
  private readonly initialStatuses = new Set<TimesheetEntryStatus>([
    TimesheetEntryStatus.SAVED,
    TimesheetEntryStatus.PENDING_APPROVAL,
  ]);

  private isLockedStatus(status: TimesheetEntryStatus) {
    return status === TimesheetEntryStatus.APPROVED || status === TimesheetEntryStatus.INVOICED;
  }

  private ensureTransitionIsAllowed(
    current: TimesheetEntryStatus,
    next: TimesheetEntryStatus,
  ): void {
    if (current === next) {
      return;
    }

    const allowedTransitions: Record<TimesheetEntryStatus, TimesheetEntryStatus[]> = {
      [TimesheetEntryStatus.SAVED]: [TimesheetEntryStatus.PENDING_APPROVAL],
      [TimesheetEntryStatus.PENDING_APPROVAL]: [
        TimesheetEntryStatus.SAVED,
        TimesheetEntryStatus.APPROVED,
        TimesheetEntryStatus.REJECTED,
      ],
      [TimesheetEntryStatus.REJECTED]: [
        TimesheetEntryStatus.SAVED,
        TimesheetEntryStatus.PENDING_APPROVAL,
      ],
      [TimesheetEntryStatus.APPROVED]: [TimesheetEntryStatus.INVOICED],
      [TimesheetEntryStatus.INVOICED]: [],
    };

    const nextStates = allowedTransitions[current] ?? [];
    if (!nextStates.includes(next)) {
      throw new UnprocessableEntityError(`Invalid status transition from ${current} to ${next}.`);
    }
  }

  private async applyStatus(
    entry: TimesheetEntry,
    nextStatus: TimesheetEntryStatus,
  ): Promise<TimesheetEntry> {
    this.ensureTransitionIsAllowed(entry.status, nextStatus);
    const updated = await this.timesheetEntryRepository.update(entry.id, {
      status: nextStatus,
      statusUpdatedAt: new Date(),
    });
    return updated!;
  }

  /**
   * @description Ensures that a given DTO (Data Transfer Object) is valid by performing class-validator validation.
   * @param dto The DTO object to validate.
   * @returns A Promise that resolves if validation passes.
   * @throws {UnprocessableEntityError} If validation fails, containing details of the validation errors.
   */
  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(', ')}`,
      );
    }
  }

  /**
   * @description Creates a new timesheet entry.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user creating the entry.
   * @param dto The CreateTimesheetEntryDto containing the details for the new entry.
   * @returns A Promise that resolves to the newly created TimesheetEntry entity.
   */
  public async createTimesheetEntry(
    companyId: string,
    userId: string,
    dto: CreateTimesheetEntryDto,
  ): Promise<TimesheetEntry> {
    await this.ensureValidation(dto);
    const { status: requestedStatus, ...rest } = dto;
    const status = requestedStatus !== undefined ? requestedStatus : TimesheetEntryStatus.SAVED;

    if (requestedStatus && !this.initialStatuses.has(requestedStatus)) {
      throw new UnprocessableEntityError(
        `New entries can only be created in ${Array.from(this.initialStatuses).join(', ')} states.`,
      );
    }

    return this.timesheetEntryRepository.create({
      companyId,
      userId,
      ...rest,
      status,
      statusUpdatedAt: new Date(),
    });
  }

  /**
   * @description Retrieves a timesheet entry by its unique identifier.
   * @param id The unique identifier of the timesheet entry.
   * @returns A Promise that resolves to the TimesheetEntry entity.
   * @throws {NotFoundError} If the timesheet entry is not found.
   */
  public async getTimesheetEntryById(id: string): Promise<TimesheetEntry> {
    const entry = await this.timesheetEntryRepository.findById(id);
    if (!entry) throw new NotFoundError('Timesheet entry not found');
    return entry;
  }

  /**
   * @description Retrieves all timesheet entries for a specific timesheet.
   * @param timesheetId The unique identifier of the timesheet.
   * @returns A Promise that resolves to an array of TimesheetEntry entities.
   */
  public async getAllTimesheetEntriesForTimesheet(timesheetId: string): Promise<TimesheetEntry[]> {
    return this.timesheetEntryRepository.findAllForTimesheet(timesheetId);
  }

  /**
   * @description Updates an existing timesheet entry.
   * @param id The unique identifier of the timesheet entry to update.
   * @param dto The UpdateTimesheetEntryDto containing the updated details for the entry.
   * @returns A Promise that resolves to the updated TimesheetEntry entity.
   * @throws {NotFoundError} If the timesheet entry to update is not found.
   */
  public async updateTimesheetEntry(
    id: string,
    dto: UpdateTimesheetEntryDto,
  ): Promise<TimesheetEntry> {
    await this.ensureValidation(dto);
    const entry = await this.getTimesheetEntryById(id);

    const { status: requestedStatus, ...rest } = dto;

    if (this.isLockedStatus(entry.status) && Object.keys(rest).length > 0) {
      throw new UnprocessableEntityError(`Entries in status ${entry.status} cannot be edited.`);
    }

    if (
      entry.status === TimesheetEntryStatus.INVOICED &&
      requestedStatus &&
      requestedStatus !== entry.status
    ) {
      throw new UnprocessableEntityError('Invoiced time entries cannot change status.');
    }

    if (requestedStatus) {
      this.ensureTransitionIsAllowed(entry.status, requestedStatus);
    }

    const payload: Partial<TimesheetEntry> = {
      ...rest,
    };

    if (requestedStatus && requestedStatus !== entry.status) {
      payload.status = requestedStatus;
      payload.statusUpdatedAt = new Date();
    }

    const updated = await this.timesheetEntryRepository.update(id, payload);
    return updated!;
  }

  /**
   * @description Deletes a timesheet entry by its unique identifier.
   * @param id The unique identifier of the timesheet entry to delete.
   * @returns A Promise that resolves when the deletion is complete.
   * @throws {NotFoundError} If the timesheet entry to delete is not found.
   */
  public async deleteTimesheetEntry(id: string): Promise<void> {
    await this.getTimesheetEntryById(id);
    await this.timesheetEntryRepository.delete(id);
  }

  /**
   * @description Moves an entry to Pending Approval.
   */
  public async submitTimesheetEntry(id: string): Promise<TimesheetEntry> {
    const entry = await this.getTimesheetEntryById(id);
    if (
      entry.status !== TimesheetEntryStatus.SAVED &&
      entry.status !== TimesheetEntryStatus.REJECTED
    ) {
      throw new UnprocessableEntityError(
        `Only saved or rejected entries can be submitted for approval (current status: ${entry.status}).`,
      );
    }
    return this.applyStatus(entry, TimesheetEntryStatus.PENDING_APPROVAL);
  }

  /**
   * @description Marks an entry as approved.
   */
  public async approveTimesheetEntry(id: string): Promise<TimesheetEntry> {
    const entry = await this.getTimesheetEntryById(id);
    if (entry.status !== TimesheetEntryStatus.PENDING_APPROVAL) {
      throw new UnprocessableEntityError('Only entries pending approval can be approved.');
    }
    return this.applyStatus(entry, TimesheetEntryStatus.APPROVED);
  }

  /**
   * @description Rejects an entry, returning it to the submitter.
   */
  public async rejectTimesheetEntry(id: string): Promise<TimesheetEntry> {
    const entry = await this.getTimesheetEntryById(id);
    if (entry.status !== TimesheetEntryStatus.PENDING_APPROVAL) {
      throw new UnprocessableEntityError('Only entries pending approval can be rejected.');
    }
    return this.applyStatus(entry, TimesheetEntryStatus.REJECTED);
  }

  /**
   * @description Marks an entry as invoiced.
   */
  public async invoiceTimesheetEntry(id: string): Promise<TimesheetEntry> {
    const entry = await this.getTimesheetEntryById(id);
    if (entry.status !== TimesheetEntryStatus.APPROVED) {
      throw new UnprocessableEntityError('Only approved entries can be invoiced.');
    }
    return this.applyStatus(entry, TimesheetEntryStatus.INVOICED);
  }
}
