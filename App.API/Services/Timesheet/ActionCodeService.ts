import { Inject, Service } from 'typedi';
import { validate } from 'class-validator';
import { ActionCodeRepository } from '../../Repositories/Timesheets/ActionCodeRepository';
import { TimesheetHistoryRepository } from '../../Repositories/Timesheets/TimesheetHistoryRepository';
import { ActionCode } from '../../Entities/Timesheets/ActionCode';
import { NotFoundError, UnprocessableEntityError } from '../../Errors/HttpErrors';
import { CreateActionCodeDto, UpdateActionCodeDto } from '../../Dtos/Timesheet/TimesheetDto';

/**
 * @description Service layer for managing ActionCode entities. This service provides business logic
 * for creating, retrieving, updating, and deleting action codes, and records these events in the timesheet history.
 */
export class ActionCodeService {
  /**
   * @description Initializes the ActionCodeService with necessary repositories.
   * @param actionCodeRepository The repository for ActionCode entities.
   * @param historyRepository The repository for TimesheetHistory entities.
   */
  constructor(
    @Inject('ActionCodeRepository') private readonly actionCodeRepository: ActionCodeRepository,
    @Inject('TimesheetHistoryRepository')
    private readonly historyRepository: TimesheetHistoryRepository,
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
   * @description Records an event related to an action code in the timesheet history.
   * @param companyId The unique identifier of the company.
   * @param payload An object containing details about the event.
   * @param payload.userId The unique identifier of the user associated with the event.
   * @param payload.targetType The type of the target entity (e.g., "ActionCode").
   * @param payload.targetId The unique identifier of the target entity.
   * @param payload.action The action performed (e.g., "created", "updated", "deleted").
   * @param payload.actorUserId Optional: The unique identifier of the user who performed the action, if different from `userId`.
   * @param payload.reason Optional: A reason for the action.
   * @param payload.diff Optional: A record of changes made during an update.
   * @param payload.metadata Optional: Additional metadata related to the action.
   * @returns A Promise that resolves when the event is recorded.
   */
  private async recordEvent(
    companyId: string,
    payload: {
      userId: string;
      targetType: 'ActionCode' | 'Timesheet' | 'TimesheetEntry' | 'TimesheetApproval';
      targetId: string;
      action: 'created' | 'updated' | 'deleted' | 'submitted' | 'approved' | 'rejected';
      actorUserId?: string;
      reason?: string;
      diff?: Record<string, string>;
      metadata?: Record<string, string>;
    },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.historyRepository.create({ companyId, ...payload } as any);
  }

  /**
   * @description Searches for action codes within a specific company based on a query string.
   * @param companyId The unique identifier of the company.
   * @param q Optional: The query string to search for in action code names or codes.
   * @returns {Promise<ActionCode[]>} A Promise that resolves to an array of matching ActionCode entities.
   */
  public async search(companyId: string, q?: string): Promise<ActionCode[]> {
    return this.actionCodeRepository.search(companyId, q);
  }

  /**
   * @description Retrieves an action code by its unique identifier within a specific company.
   * @param companyId The unique identifier of the company.
   * @param id The unique identifier of the action code.
   * @returns A Promise that resolves to the ActionCode entity.
   * @throws {NotFoundError} If the action code is not found or does not belong to the specified company.
   */
  public async getActionCodeById(companyId: string, id: string): Promise<ActionCode> {
    const actionCode = await this.actionCodeRepository.findById(id);
    if (!actionCode || actionCode.companyId !== companyId) {
      throw new NotFoundError('Action code not found');
    }
    return actionCode;
  }

  /**
   * @description Creates a new action code within a specified company.
   * @param companyId The unique identifier of the company.
   * @param actorUserId The unique identifier of the user creating the action code.
   * @param dto The CreateActionCodeDto containing the name and code for the new action code.
   * @returns A Promise that resolves to the newly created ActionCode entity.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   */
  public async create(
    companyId: string,
    actorUserId: string,
    dto: CreateActionCodeDto,
  ): Promise<ActionCode> {
    await this.ensureValidation(dto);

    const created = await this.actionCodeRepository.create({
      companyId,
      ...dto,
    });
    await this.recordEvent(companyId, {
      userId: actorUserId,
      targetType: 'ActionCode',
      targetId: created.id,
      action: 'created',
    });
    return created;
  }

  /**
   * @description Updates an existing action code within a specified company.
   * @param companyId The unique identifier of the company.
   * @param actorUserId The unique identifier of the user updating the action code.
   * @param id The unique identifier of the action code to update.
   * @param dto The UpdateActionCodeDto containing the updated name and code.
   * @returns A Promise that resolves to the updated ActionCode entity.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   * @throws {NotFoundError} If the action code is not found or does not belong to the specified company.
   */
  public async update(
    companyId: string,
    actorUserId: string,
    id: string,
    dto: UpdateActionCodeDto,
  ): Promise<ActionCode> {
    await this.ensureValidation(dto);

    const existing = await this.actionCodeRepository.findById(id);
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundError('Action code not found');
    }

    const before = { name: existing.name, code: existing.code } as Record<string, string>;
    const updated = await this.actionCodeRepository.update(id, dto);
    if (!updated) throw new NotFoundError('Failed to update Action code');

    await this.recordEvent(companyId, {
      userId: actorUserId,
      targetType: 'ActionCode',
      targetId: updated.id,
      action: 'updated',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      diff: { ...before, ...(dto as any) },
    });

    return updated;
  }

  /**
   * @description Deletes an action code within a specified company.
   * @param companyId The unique identifier of the company.
   * @param actorUserId The unique identifier of the user deleting the action code.
   * @param id The unique identifier of the action code to delete.
   * @returns A Promise that resolves when the deletion is complete.
   * @throws {NotFoundError} If the action code is not found or does not belong to the specified company.
   */
  public async delete(companyId: string, actorUserId: string, id: string): Promise<void> {
    const existing = await this.actionCodeRepository.findById(id);
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundError('Action code not found');
    }

    await this.actionCodeRepository.delete(id);
    await this.recordEvent(companyId, {
      userId: actorUserId,
      targetType: 'ActionCode',
      targetId: id,
      action: 'deleted',
    });
  }
}
