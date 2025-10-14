import Container, { Service } from 'typedi';
import { AuthLog } from '../../../Entities/Logs/Security/AuthLog';
import { BaseRepository } from '../../BaseRepository';

export class AuthLogRepository extends BaseRepository<AuthLog> {
  constructor() {
    super(AuthLog);
  }
}

Container.set('AuthLogRepository', new AuthLogRepository());
