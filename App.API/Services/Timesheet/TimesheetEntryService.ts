import { Inject, Service } from 'typedi';
import { TimesheetEntryRepository } from '../../Repositories/Timesheets/TimesheetEntryRepository';
import { TimesheetEntry } from '../../Entities/Timesheets/TimesheetEntry';
import { NotFoundError } from '../../Errors/HttpErrors';
import {
  CreateTimesheetEntryDto,
  UpdateTimesheetEntryDto,
} from '../../Dtos/Timesheet/TimesheetDto';
import { validate } from 'class-validator';
import { UnprocessableEntityError } from '../../Errors/HttpErrors';

/**
 * @description Service layer for managing TimesheetEntry entities. This service provides business logic
 * for creating, retrieving, updating, and deleting timesheet entries.
 */
export class TimesheetEntryService {
  /**
   * @description Initializes the TimesheetEntryService with the TimesheetEntryRepository.
   * @param timesheetEntryRepository The repository for TimesheetEntry entities, injected by TypeDI.
   */
  constructor(
    @Inject('TimesheetEntryRepository')
    private readonly timesheetEntryRepository: TimesheetEntryRepository,
  ) {}

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
    return this.timesheetEntryRepository.create({ companyId, userId, ...dto });
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
    await this.getTimesheetEntryById(id);
    const updated = await this.timesheetEntryRepository.update(id, dto);
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
}
