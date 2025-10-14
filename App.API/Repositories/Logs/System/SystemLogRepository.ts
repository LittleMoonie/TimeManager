import Container, { Service } from 'typedi';
import { SystemLog } from '../../../Entities/Logs/System/SystemLog';
import { BaseRepository } from '../../BaseRepository';

export class SystemLogRepository extends BaseRepository<SystemLog> {
  constructor() {
    super(SystemLog);
  }
}

