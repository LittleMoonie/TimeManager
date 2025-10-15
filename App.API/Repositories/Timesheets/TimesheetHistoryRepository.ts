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
}

Container.set('TimesheetHistoryRepository', new TimesheetHistoryRepository());
