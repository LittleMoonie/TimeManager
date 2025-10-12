import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import { TimesheetHistory } from "../../Entities/Timesheets/TimesheetHistory";
import { BaseRepository } from "../../Repositories/BaseRepository";

/**
 * @description Repository for managing TimesheetHistory entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying timesheet history records.
 */
@Service()
export class TimesheetHistoryRepository extends BaseRepository<TimesheetHistory> {
  /**
   * @description Initializes the TimesheetHistoryRepository with a TypeORM Repository instance for TimesheetHistory.
   * @param repo The TypeORM Repository<TimesheetHistory> injected by TypeDI.
   */
  constructor(
    @InjectRepository(TimesheetHistory) repo: Repository<TimesheetHistory>,
  ) {
    super(TimesheetHistory, repo);
  }

  /**
   * @description Finds all history records for a specific target entity within a given company.
   * @param companyId The unique identifier of the company.
   * @param targetType The type of the target entity (e.g., "Timesheet", "TimesheetEntry").
   * @param targetId The unique identifier of the target entity.
   * @returns A Promise that resolves to an array of TimesheetHistory entities.
   */
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
