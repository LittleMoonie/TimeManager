import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import { TimesheetHistory } from "../../Entities/Timesheets/TimesheetHistory";
import { BaseRepository } from "../BaseRepository";

@Service()
export class TimesheetHistoryRepository extends BaseRepository<TimesheetHistory> {
  constructor(@InjectRepository(TimesheetHistory) repo: Repository<TimesheetHistory>) {
    super(TimesheetHistory, repo);
  }

  async findAllForTarget(
    companyId: string,
    targetType: "Timesheet" | "TimesheetEntry" | "TimesheetApproval" | "ActionCode",
    targetId: string,
  ): Promise<TimesheetHistory[]> {
    return this.repository.find({ where: { companyId, targetType, targetId } });
  }
}
