import { TimesheetApproval } from "../../Entities/Timesheets/TimesheetApproval";
import { BaseRepository } from "../BaseRepository";

export class TimesheetApprovalRepository extends BaseRepository<TimesheetApproval> {
  constructor() {
    super(TimesheetApproval);
  }

  async findByTimesheetIdAndApproverId(
    timesheetId: string,
    approverId: string,
  ): Promise<TimesheetApproval | null> {
    return this.repository.findOne({ where: { timesheetId, approverId } });
  }

  async findAllForTimesheet(timesheetId: string): Promise<TimesheetApproval[]> {
    return this.repository.find({ where: { timesheetId } });
  }
}
