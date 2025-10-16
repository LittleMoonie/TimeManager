import Container, { Service } from 'typedi';

import { TimesheetHistory } from '../../Entities/Timesheets/TimesheetHistory';
import { BaseRepository } from '../BaseRepository';

@Service()
export class TimesheetHistoryRepository extends BaseRepository<TimesheetHistory> {
  constructor() {
    super(TimesheetHistory);
  }

  public async findAllForTarget(
    companyId: string,
    targetType: 'Timesheet' | 'TimesheetEntry' | 'TimesheetApproval' | 'ActionCode',
    targetId: string,
  ) {
    // @ts-expect-error - targetType is a string literal, but the entity expects a string
    return this.find({ where: { companyId, targetType, targetId } });
  }

  public async findLatestForTimesheet(
    companyId: string,
    timesheetId: string,
    action: 'rejected' | 'approved' | 'submitted' | 'updated' | 'created' | 'deleted',
  ): Promise<TimesheetHistory | null> {
    return this.repository.findOne({
      where: {
        companyId,
        targetType: 'Timesheet',
        targetId: timesheetId,
        action,
      },
      order: { occurredAt: 'DESC' },
    });
  }
}

Container.set('TimesheetHistoryRepository', new TimesheetHistoryRepository());
