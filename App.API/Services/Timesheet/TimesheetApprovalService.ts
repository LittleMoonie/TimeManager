import { Service } from "typedi";
import { TimesheetApprovalRepository } from "../../Repositories/Timesheets/TimesheetApprovalRepository";
import { TimesheetApproval } from "../../Entities/Timesheets/TimesheetApproval";
import { NotFoundError } from "../../Errors/HttpErrors";
import {
  CreateTimesheetApprovalDto,
  UpdateTimesheetApprovalDto,
} from "../../Dtos/Timesheet/TimesheetApprovalDto";

@Service()
export class TimesheetApprovalService {
  constructor(
    private timesheetApprovalRepository: TimesheetApprovalRepository,
  ) {}

  public async createTimesheetApproval(
    companyId: string,
    createTimesheetApprovalDto: CreateTimesheetApprovalDto,
  ): Promise<TimesheetApproval> {
    return this.timesheetApprovalRepository.create({
      companyId,
      ...createTimesheetApprovalDto,
    });
  }

  public async getTimesheetApprovalById(
    id: string,
  ): Promise<TimesheetApproval> {
    const approval = await this.timesheetApprovalRepository.findById(id);
    if (!approval) {
      throw new NotFoundError("Timesheet approval not found");
    }
    return approval;
  }

  public async updateTimesheetApproval(
    id: string,
    updateTimesheetApprovalDto: UpdateTimesheetApprovalDto,
  ): Promise<TimesheetApproval> {
    await this.getTimesheetApprovalById(id);
    const updatedApproval = await this.timesheetApprovalRepository.update(
      id,
      updateTimesheetApprovalDto,
    );
    return updatedApproval!;
  }

  public async deleteTimesheetApproval(id: string): Promise<void> {
    await this.getTimesheetApprovalById(id);
    await this.timesheetApprovalRepository.delete(id);
  }
}
