import { TimesheetEntry } from "../../Entities/Timesheets/TimesheetEntry";
import { BaseRepository } from "../BaseRepository";

export class TimesheetEntryRepository extends BaseRepository<TimesheetEntry> {
  constructor() {
    super(TimesheetEntry);
  }

  async findAllForTimesheet(timesheetId: string): Promise<TimesheetEntry[]> {
    return this.repository.find({ where: { timesheetId } });
  }
}
