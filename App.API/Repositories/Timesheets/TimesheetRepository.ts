import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { FindOneOptions, Repository } from "typeorm";
import { Timesheet } from "../../Entities/Timesheets/Timesheet";
import { BaseRepository } from "../BaseRepository";

/**
 * @description Repository for managing Timesheet entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying timesheets by period and for a specific user.
 */
@Service()
export class TimesheetRepository extends BaseRepository<Timesheet> {
  /**
   * @description Initializes the TimesheetRepository with a TypeORM Repository instance for Timesheet.
   * @param repo The TypeORM Repository<Timesheet> injected by TypeDI.
   */
  constructor(@InjectRepository(Timesheet) repo: Repository<Timesheet>) {
    super(Timesheet, repo);
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
      relations: ["entries", "entries.actionCode"],
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
  async findAllForUser(
    companyId: string,
    userId: string,
  ): Promise<Timesheet[]> {
    return this.repository.find({
      where: { companyId, userId },
      relations: ["entries", "entries.actionCode"],
    });
  }
}
