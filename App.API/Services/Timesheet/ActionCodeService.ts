import { Service } from "typedi";
import { validate } from "class-validator";
import { ActionCodeRepository } from "../../Repositories/Timesheets/ActionCodeRepository";
import { TimesheetHistoryRepository } from "../../Repositories/Timesheets/TimesheetHistoryRepository";
import { ActionCode } from "../../Entities/Timesheets/ActionCode";
import { NotFoundError, UnprocessableEntityError } from "../../Errors/HttpErrors";
import { CreateActionCodeDto, UpdateActionCodeDto } from "../../Dtos/Timesheet/TimesheetDto";

@Service()
export class ActionCodeService {
  constructor(
    private readonly actionCodeRepository: ActionCodeRepository,
    private readonly historyRepository: TimesheetHistoryRepository,
  ) {}

  private async ensureValidation(dto: unknown): Promise<void> {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(`Validation error: ${errors.map(e => e.toString()).join(", ")}`);
    }
  }

  private async recordEvent(companyId: string, payload: {
    userId: string;
    targetType: "ActionCode" | "Timesheet" | "TimesheetEntry" | "TimesheetApproval";
    targetId: string;
    action: "created" | "updated" | "deleted" | "submitted" | "approved" | "rejected";
    actorUserId?: string;
    reason?: string;
    diff?: Record<string, string>;
    metadata?: Record<string, string>;
  }) {
    await this.historyRepository.create({ companyId, ...payload } as any);
  }

  public async search(companyId: string, q?: string): Promise<ActionCode[]> {
    return this.actionCodeRepository.search(companyId, q);
  }

  public async create(companyId: string, actorUserId: string, dto: CreateActionCodeDto): Promise<ActionCode> {
    await this.ensureValidation(dto);

    const created = await this.actionCodeRepository.create({ companyId, ...dto });
    await this.recordEvent(companyId, {
      userId: actorUserId,
      targetType: "ActionCode",
      targetId: created.id,
      action: "created",
    });
    return created;
  }

  public async update(companyId: string, actorUserId: string, id: string, dto: UpdateActionCodeDto): Promise<ActionCode> {
    await this.ensureValidation(dto);

    const existing = await this.actionCodeRepository.findById(id);
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundError("Action code not found");
    }

    const before = { name: existing.name, code: existing.code } as Record<string, string>;
    const updated = await this.actionCodeRepository.update(id, dto);
    if (!updated) throw new NotFoundError("Failed to update Action code");

    await this.recordEvent(companyId, {
      userId: actorUserId,
      targetType: "ActionCode",
      targetId: updated.id,
      action: "updated",
      diff: { ...before, ...dto as any },
    });

    return updated;
  }

  public async delete(companyId: string, actorUserId: string, id: string): Promise<void> {
    const existing = await this.actionCodeRepository.findById(id);
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundError("Action code not found");
    }

    await this.actionCodeRepository.delete(id);
    await this.recordEvent(companyId, {
      userId: actorUserId,
      targetType: "ActionCode",
      targetId: id,
      action: "deleted",
    });
  }
}
