import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';
import { TimesheetEntry } from '../../Entities/Timesheets/TimesheetEntry';
import { BaseRepository } from '../../Repositories/BaseRepository';

/**
 * @description Repository for managing TimesheetEntry entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying timesheet entries.
 */
@Service()
export class TimesheetEntryRepository extends BaseRepository<TimesheetEntry> {
  /**
   * @description Initializes the TimesheetEntryRepository with a TypeORM Repository instance for TimesheetEntry.
   * @param repo The TypeORM Repository<TimesheetEntry> injected by TypeDI.
   */
  constructor(@InjectRepository(TimesheetEntry) repo: Repository<TimesheetEntry>) {
    super(TimesheetEntry, repo);
  }

  /**
   * @description Finds all timesheet entries associated with a specific timesheet ID.
   * @param timesheetId The unique identifier of the timesheet.
   * @returns A Promise that resolves to an array of TimesheetEntry entities.
   */
  async findAllForTimesheet(timesheetId: string): Promise<TimesheetEntry[]> {
    return this.repository.find({ where: { timesheetId } });
  }
}
