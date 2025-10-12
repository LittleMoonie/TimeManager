import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import { TimesheetEntry } from "../../Entities/Timesheets/TimesheetEntry";
import { BaseRepository } from "../BaseRepository";

@Service()
export class TimesheetEntryRepository extends BaseRepository<TimesheetEntry> {
  constructor(@InjectRepository(TimesheetEntry) repo: Repository<TimesheetEntry>) {
    super(TimesheetEntry, repo);
  }

  async findAllForTimesheet(timesheetId: string): Promise<TimesheetEntry[]> {
    return this.repository.find({ where: { timesheetId } });
  }
}
