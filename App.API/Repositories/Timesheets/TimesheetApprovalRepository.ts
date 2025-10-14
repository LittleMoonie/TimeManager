import Container, { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../Repositories/BaseRepository';
import { TimesheetApproval } from '../../Entities/Timesheets/TimesheetApproval';

/**
 * @description Repository for managing TimesheetApproval entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying timesheet approvals.
 */
export class TimesheetApprovalRepository extends BaseRepository<TimesheetApproval> {
  /**
   * @description Initializes the TimesheetApprovalRepository with a TypeORM Repository instance for TimesheetApproval.
   * @param repo The TypeORM Repository<TimesheetApproval> injected by TypeDI.
   */
  constructor(@InjectRepository(TimesheetApproval) repo: Repository<TimesheetApproval>) {
    super(TimesheetApproval, repo);
  }

  /**
   * @description Finds a timesheet approval by timesheet ID and approver ID within a specific company.
   * @param companyId The unique identifier of the company.
   * @param timesheetId The unique identifier of the timesheet.
   * @param approverId The unique identifier of the approver.
   * @returns A Promise that resolves to the TimesheetApproval entity or null if not found.
   */
  async findByTimesheetIdAndApproverId(
    companyId: string,
    timesheetId: string,
    approverId: string,
  ): Promise<TimesheetApproval | null> {
    return this.repository.findOne({
      where: { companyId, timesheetId, approverId },
    });
  }

  /**
   * @description Finds all timesheet approvals for a specific timesheet within a given company.
   * @param companyId The unique identifier of the company.
   * @param timesheetId The unique identifier of the timesheet.
   * @returns A Promise that resolves to an array of TimesheetApproval entities, ordered by creation date.
   */
  async findAllForTimesheet(
    _companyId: string,
    _timesheetId: string,
  ): Promise<TimesheetApproval[]> {
    return this.repository.find({
      where: { companyId: _companyId, timesheetId: _timesheetId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order: { createdAt: 'DESC' } as any,
    });
  }

  /**
   * @description Finds all timesheet approvals for a specific company.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to an array of TimesheetApproval entities, ordered by creation date.
   */
  async findAllInCompany(companyId: string): Promise<TimesheetApproval[]> {
    return this.repository.find({
      where: { companyId }, // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order: { createdAt: 'DESC' } as any,
    });
  }

  /**
   * @description Finds all timesheet approvals for a specific approver within a given company.
   * @param companyId The unique identifier of the company.
   * @param approverId The unique identifier of the approver.
   * @returns A Promise that resolves to an array of TimesheetApproval entities, ordered by creation date.
   */
  async findAllForApprover(companyId: string, approverId: string): Promise<TimesheetApproval[]> {
    return this.repository.find({
      where: { companyId, approverId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order: { createdAt: 'DESC' } as any,
    });
  }
}
