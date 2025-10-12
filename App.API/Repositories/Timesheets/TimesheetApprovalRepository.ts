import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import { BaseRepository } from "../BaseRepository";
import { TimesheetApproval } from "../../Entities/Timesheets/TimesheetApproval";

@Service()
export class TimesheetApprovalRepository extends BaseRepository<TimesheetApproval> {
  constructor(@InjectRepository(TimesheetApproval) repo: Repository<TimesheetApproval>) {
    super(TimesheetApproval, repo);
  }

  async findByTimesheetIdAndApproverId(
    companyId: string,
    timesheetId: string,
    approverId: string,
  ): Promise<TimesheetApproval | null> {
    return this.repository.findOne({ where: { companyId, timesheetId, approverId } });
  }

  async findAllForTimesheet(companyId: string, timesheetId: string): Promise<TimesheetApproval[]> {
    return this.repository.find({
      where: { companyId, timesheetId },
      order: { createdAt: "DESC" } as any,
    });
  }

  async findAllForApprover(companyId: string, approverId: string): Promise<TimesheetApproval[]> {
    return this.repository.find({
      where: { companyId, approverId },
      order: { createdAt: "DESC" } as any,
    });
  }
}
