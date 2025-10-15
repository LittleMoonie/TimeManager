import { Service } from 'typedi';

import { SystemLog } from '../../../Entities/Logs/System/SystemLog';
import { BaseRepository } from '../../BaseRepository';

@Service('SystemLogRepository')
export class SystemLogRepository extends BaseRepository<SystemLog> {
  constructor() {
    super(SystemLog);
  }
}
