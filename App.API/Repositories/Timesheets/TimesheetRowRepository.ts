import Container, { Service } from 'typedi';

import { TimesheetRow } from '../../Entities/Timesheets/TimesheetRow';
import { BaseRepository } from '../BaseRepository';

@Service('TimesheetRowRepository')
export class TimesheetRowRepository extends BaseRepository<TimesheetRow> {
  constructor() {
    super(TimesheetRow);
  }

  async findAllForTimesheet(timesheetId: string): Promise<TimesheetRow[]> {
    return this.repository.find({
      where: { timesheetId },
      relations: ['timeCode', 'entries'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }
}

Container.set('TimesheetRowRepository', new TimesheetRowRepository());
