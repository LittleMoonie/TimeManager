import { Service } from "typedi";
import { validate } from "class-validator";
import { TimesheetApprovalRepository } from "../../Repositories/Timesheets/TimesheetApprovalRepository";
import { TimesheetApproval } from "../../Entities/Timesheets/TimesheetApproval";
import { NotFoundError, UnprocessableEntityError } from "../../Errors/HttpErrors";
import { CreateTimesheetApprovalDto, UpdateTimesheetApprovalDto } from "../../Dtos/Timesheet/TimesheetDto";

@Service()
export class TimesheetApprovalService {
  constructor(private readonly timesheetApprovalRepository: TimesheetApprovalRepository) {}

  private async ensureValidation(dto: unknown): Promise<void> {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(`Validation error: ${errors.map(e => e.toString()).join(", ")}`);
    }
  }

  public async createTimesheetApproval(companyId: string, dto: CreateTimesheetApprovalDto): Promise<TimesheetApproval> {
    await this.ensureValidation(dto);

    const existing = await this.timesheetApprovalRepository.findByTimesheetIdAndApproverId(
      companyId,
      dto.timesheetId,
      dto.approverId
    );
    if (existing) {
      throw new UnprocessableEntityError("An approval for this timesheet and approver already exists.");
    }

    return this.timesheetApprovalRepository.create({ companyId, ...dto });
  }

  public async getTimesheetApprovalById(companyId: string, id: string): Promise<TimesheetApproval> {
    const approval = await this.timesheetApprovalRepository.findById(id);
    if (!approval || approval.companyId !== companyId) {
      throw new NotFoundError("Timesheet approval not found");
    }
    return approval;
  }

  public async updateTimesheetApproval(companyId: string, id: string, dto: UpdateTimesheetApprovalDto): Promise<TimesheetApproval> {
    await this.ensureValidation(dto);
    await this.getTimesheetApprovalById(companyId, id);

    const updated = await this.timesheetApprovalRepository.update(id, dto);
    if (!updated) {
      const reloaded = await this.timesheetApprovalRepository.findById(id);
      if (!reloaded || reloaded.companyId !== companyId) {
        throw new NotFoundError("Timesheet approval not found after update");
      }
      return reloaded;
    }
    return updated;
  }

  public async deleteTimesheetApproval(companyId: string, id: string): Promise<void> {
    await this.getTimesheetApprovalById(companyId, id);
    await this.timesheetApprovalRepository.delete(id);
  }

  public async listApprovalsForTimesheet(companyId: string, timesheetId: string) {
    return this.timesheetApprovalRepository.findAllForTimesheet(companyId, timesheetId);
  }

  public async listApprovalsForApprover(companyId: string, approverId: string) {
    return this.timesheetApprovalRepository.findAllForApprover(companyId, approverId);
  }
}
