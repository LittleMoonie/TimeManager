import Container, { Service } from 'typedi';
import { ActionLog } from '../../../Entities/Logs/Actions/ActionLog';
import { BaseRepository } from '../../BaseRepository';

export class ActionLogRepository extends BaseRepository<ActionLog> {
  constructor() {
    super(ActionLog);
  }
}

