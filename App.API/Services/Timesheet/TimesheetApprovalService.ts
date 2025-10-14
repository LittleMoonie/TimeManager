import { Inject, Service } from 'typedi';
import { validate } from 'class-validator';
import { TimesheetApprovalRepository } from '../../Repositories/Timesheets/TimesheetApprovalRepository';
import { TimesheetApproval } from '../../Entities/Timesheets/TimesheetApproval';
import { NotFoundError, UnprocessableEntityError } from '../../Errors/HttpErrors';
import {
  CreateTimesheetApprovalDto,
  UpdateTimesheetApprovalDto,
} from '../../Dtos/Timesheet/TimesheetDto';

/**
 * @description Service layer for managing TimesheetApproval entities. This service provides business logic
 * for creating, retrieving, updating, and deleting timesheet approvals.
 */
export class TimesheetApprovalService {
  /**
   * @description Initializes the TimesheetApprovalService with the TimesheetApprovalRepository.
   * @param timesheetApprovalRepository The repository for TimesheetApproval entities, injected by TypeDI.
   */
  constructor(
    @Inject('TimesheetApprovalRepository')
    private readonly timesheetApprovalRepository: TimesheetApprovalRepository,
  ) {}

  /**
   * @description Ensures that a given DTO (Data Transfer Object) is valid by performing class-validator validation.
   * @param dto The DTO object to validate.
   * @returns A Promise that resolves if validation passes.
   * @throws {UnprocessableEntityError} If validation fails, containing details of the validation errors.
   */
  private async ensureValidation(dto: unknown): Promise<void> {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(', ')}`,
      );
    }
  }

  /**
   * @description Creates a new timesheet approval.
   * @param companyId The unique identifier of the company.
   * @param dto The CreateTimesheetApprovalDto containing the timesheet ID and approver ID.
   * @returns A Promise that resolves to the newly created TimesheetApproval entity.
   * @throws {UnprocessableEntityError} If validation fails or an approval for the same timesheet and approver already exists.
   */
  public async createTimesheetApproval(
    companyId: string,
    dto: CreateTimesheetApprovalDto,
  ): Promise<TimesheetApproval> {
    await this.ensureValidation(dto);

    const existing = await this.timesheetApprovalRepository.findByTimesheetIdAndApproverId(
      companyId,
      dto.timesheetId,
      dto.approverId,
    );
    if (existing) {
      throw new UnprocessableEntityError(
        'An approval for this timesheet and approver already exists.',
      );
    }

    return this.timesheetApprovalRepository.create({ companyId, ...dto });
  }

  /**
   * @description Retrieves a timesheet approval by its unique identifier within a specific company.
   * @param companyId The unique identifier of the company.
   * @param id The unique identifier of the timesheet approval.
   * @returns A Promise that resolves to the TimesheetApproval entity.
   * @throws {NotFoundError} If the timesheet approval is not found or does not belong to the specified company.
   */
  public async getTimesheetApprovalById(companyId: string, id: string): Promise<TimesheetApproval> {
    const approval = await this.timesheetApprovalRepository.findById(id);
    if (!approval || approval.companyId !== companyId) {
      throw new NotFoundError('Timesheet approval not found');
    }
    return approval;
  }

  /**
   * @description Updates an existing timesheet approval.
   * @param companyId The unique identifier of the company.
   * @param id The unique identifier of the timesheet approval to update.
   * @param dto The UpdateTimesheetApprovalDto containing the updated status and optional reason.
   * @returns A Promise that resolves to the updated TimesheetApproval entity.
   * @throws {UnprocessableEntityError} If validation fails.
   * @throws {NotFoundError} If the timesheet approval is not found or not found after update.
   */
  public async updateTimesheetApproval(
    companyId: string,
    id: string,
    dto: UpdateTimesheetApprovalDto,
  ): Promise<TimesheetApproval> {
    await this.ensureValidation(dto);
    await this.getTimesheetApprovalById(companyId, id);

    const updated = await this.timesheetApprovalRepository.update(id, dto);
    if (!updated) {
      const reloaded = await this.timesheetApprovalRepository.findById(id);
      if (!reloaded || reloaded.companyId !== companyId) {
        throw new NotFoundError('Timesheet approval not found after update');
      }
      return reloaded;
    }
    return updated;
  }

  /**
   * @description Deletes a timesheet approval by its unique identifier within a specific company.
   * @param companyId The unique identifier of the company.
   * @param id The unique identifier of the timesheet approval to delete.
   * @returns A Promise that resolves when the deletion is complete.
   * @throws {NotFoundError} If the timesheet approval is not found or does not belong to the specified company.
   */
  public async deleteTimesheetApproval(companyId: string, id: string): Promise<void> {
    await this.getTimesheetApprovalById(companyId, id);
    await this.timesheetApprovalRepository.delete(id);
  }

  /**
   * @description Lists all timesheet approvals for a specific timesheet within a given company.
   * @param companyId The unique identifier of the company.
   * @param timesheetId The unique identifier of the timesheet.
   * @returns A Promise that resolves to an array of TimesheetApproval entities.
   */
  public async listApprovalsForTimesheet(companyId: string, timesheetId: string) {
    return this.timesheetApprovalRepository.findAllForTimesheet(companyId, timesheetId);
  }

  /**
   * @description Lists all timesheet approvals for a specific approver within a given company.
   * @param companyId The unique identifier of the company.
   * @param approverId The unique identifier of the approver.
   * @returns A Promise that resolves to an array of TimesheetApproval entities.
   */
  public async listApprovalsForApprover(companyId: string, approverId: string) {
    return this.timesheetApprovalRepository.findAllForApprover(companyId, approverId);
  }

  /**
   * @description Lists all timesheet approvals for a specific company.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to an array of TimesheetApproval entities.
   */
  public async getAllTimesheetApprovals(companyId: string): Promise<TimesheetApproval[]> {
    return this.timesheetApprovalRepository.findAllInCompany(companyId);
  }
}
