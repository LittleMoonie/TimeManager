import { TimesheetHistory } from "../../Entities/Timesheets/TimesheetHistory";
import { BaseRepository } from "../BaseRepository";

export class TimesheetHistoryRepository extends BaseRepository<TimesheetHistory> {
  constructor() {
    super(TimesheetHistory);
  }

  async findAllForTarget(
    companyId: string,
    targetType:
      | "Timesheet"
      | "TimesheetEntry"
      | "TimesheetApproval"
      | "ActionCode",
    targetId: string,
  ): Promise<TimesheetHistory[]> {
    return this.repository.find({ where: { companyId, targetType, targetId } });
  }
}
