import { Service } from "typedi";
import { ActionCodeRepository } from "../../Repositories/Timesheets/ActionCodeRepository";
import { ActionCode } from "../../Entities/Timesheets/ActionCode";
import { NotFoundError } from "../../Errors/HttpErrors";
import { TimesheetHistoryService } from "../Logs/Timesheet/TimesheetHistoryService";
import {
  CreateActionCodeDto,
  UpdateActionCodeDto,
} from "../../Dtos/Timesheet/ActionCodeDto";

@Service()
export class ActionCodeService {
  constructor(
    private actionCodeRepository: ActionCodeRepository,
    private timesheetHistoryService: TimesheetHistoryService,
  ) {}

  public async search(companyId: string, q?: string): Promise<ActionCode[]> {
    if (q) {
      // This is a simple search, for more complex scenarios, we can use a dedicated search service or more complex queries.
      const allActionCodes = await this.actionCodeRepository.findAll(companyId);
      return allActionCodes.filter(
        (ac) =>
          ac.name.toLowerCase().includes(q.toLowerCase()) ||
          ac.code.toLowerCase().includes(q.toLowerCase()),
      );
    }
    return this.actionCodeRepository.findAll(companyId);
  }

  public async create(
    companyId: string,
    actorUserId: string,
    createActionCodeDto: CreateActionCodeDto,
  ): Promise<ActionCode> {
    const newActionCode = await this.actionCodeRepository.create({
      companyId,
      ...createActionCodeDto,
    });

    await this.timesheetHistoryService.recordEvent(companyId, {
      userId: actorUserId,
      targetType: "ActionCode",
      targetId: newActionCode.id,
      action: "created",
    });

    return newActionCode;
  }

  public async update(
    companyId: string,
    actorUserId: string,
    id: string,
    updateActionCodeDto: UpdateActionCodeDto,
  ): Promise<ActionCode> {
    const actionCode = await this.actionCodeRepository.findById(id);
    if (!actionCode || actionCode.companyId !== companyId) {
      throw new NotFoundError("Action code not found");
    }

    const oldActionCode = { ...actionCode };
    const updatedActionCode = await this.actionCodeRepository.update(
      id,
      updateActionCodeDto,
    );

    await this.timesheetHistoryService.recordEvent(companyId, {
      userId: actorUserId,
      targetType: "ActionCode",
      targetId: updatedActionCode ? updatedActionCode.id : id,
      action: 'updated',
      diff: {
        old: oldActionCode ? oldActionCode.id : "",
        new: updatedActionCode ? updatedActionCode.id : "",
      },
    });

    if (!updatedActionCode) {
      throw new NotFoundError("Failed to update Action code");
    }
    return updatedActionCode;
  }

  public async delete(
    companyId: string,
    actorUserId: string,
    id: string,
  ): Promise<void> {
    const actionCode = await this.actionCodeRepository.findById(id);
    if (!actionCode || actionCode.companyId !== companyId) {
      throw new NotFoundError("Action code not found");
    }

    await this.actionCodeRepository.delete(id);

    await this.timesheetHistoryService.recordEvent(companyId, {
      userId: actorUserId,
      targetType: "ActionCode",
      targetId: id,
      action: "deleted",
    });
  }
}
