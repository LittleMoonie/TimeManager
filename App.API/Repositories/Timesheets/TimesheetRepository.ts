import Container, { Service } from 'typedi';
import { FindOneOptions } from 'typeorm';

import { Timesheet } from '../../Entities/Timesheets/Timesheet';
import { BaseRepository } from '../BaseRepository';

/**
 * @description Repository for managing Timesheet entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying timesheets by period and for a specific user.
 */
@Service('TimesheetRepository')
export class TimesheetRepository extends BaseRepository<Timesheet> {
  /**
   * @description Initializes the TimesheetRepository with a TypeORM Repository instance for Timesheet.
   * @param repo The TypeORM Repository<Timesheet> injected by TypeDI.
   */
  constructor() {
    super(Timesheet);
  }

  /**
   * @description Finds a single timesheet for a specific user within a given company and period.
   * Includes related entries and their action codes.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user.
   * @param periodStart The start date of the timesheet period (e.g., "YYYY-MM-DD").
   * @param periodEnd The end date of the timesheet period (e.g., "YYYY-MM-DD").
   * @returns A Promise that resolves to the Timesheet entity or null if not found.
   */
  async findByPeriod(
    companyId: string,
    userId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<Timesheet | null> {
    const options: FindOneOptions<Timesheet> = {
      where: { companyId, userId, periodStart, periodEnd },
      relations: ['entries', 'entries.actionCode', 'rows', 'rows.timeCode', 'rows.entries'],
    };
    return this.repository.findOne(options);
  }

  /**
   * @description Finds all timesheets for a specific user within a given company.
   * Includes related entries and their action codes.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user.
   * @returns A Promise that resolves to an array of Timesheet entities.
   */
  async findAllForUser(companyId: string, userId: string): Promise<Timesheet[]> {
    return this.repository.find({
      where: { companyId, userId },
      relations: ['entries', 'entries.actionCode', 'rows', 'rows.timeCode', 'rows.entries'],
    });
  }

  /**
   * @description Finds a single timesheet by its ID, including its related entries and their action codes.
   * @param id The unique identifier of the timesheet.
   * @returns A Promise that resolves to the Timesheet entity or null if not found.
   */
  async findByIdWithEntries(id: string): Promise<Timesheet | null> {
    const options: FindOneOptions<Timesheet> = {
      where: { id },
      relations: ['entries', 'entries.actionCode', 'rows', 'rows.timeCode', 'rows.entries'],
    };
    return this.repository.findOne(options);
  }
}

Container.set('TimesheetRepository', new TimesheetRepository());
