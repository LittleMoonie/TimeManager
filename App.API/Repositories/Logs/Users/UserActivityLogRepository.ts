import Container, { Service } from 'typedi';

import { UserActivityLog } from '../../../Entities/Logs/Users/UserActivityLog';
import { BaseRepository } from '../../BaseRepository';

@Service('UserActivityLogRepository')
export class UserActivityLogRepository extends BaseRepository<UserActivityLog> {
  constructor() {
    super(UserActivityLog);
  }
}

Container.set('UserActivityLogRepository', new UserActivityLogRepository());
