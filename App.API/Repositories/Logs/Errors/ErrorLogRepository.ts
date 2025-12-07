import Container, { Service } from 'typedi';

import { ErrorLog } from '../../../Entities/Logs/Errors/ErrorLog';
import { BaseRepository } from '../../BaseRepository';

@Service('ErrorLogRepository')
export class ErrorLogRepository extends BaseRepository<ErrorLog> {
  constructor() {
    super(ErrorLog);
  }
}

Container.set('ErrorLogRepository', new ErrorLogRepository());
