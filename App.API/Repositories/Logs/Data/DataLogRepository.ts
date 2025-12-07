import Container, { Service } from 'typedi';

import { DataLog } from '../../../Entities/Logs/Data/DataLog';
import { BaseRepository } from '../../BaseRepository';

@Service('DataLogRepository')
export class DataLogRepository extends BaseRepository<DataLog> {
  constructor() {
    super(DataLog);
  }
}

Container.set('DataLogRepository', new DataLogRepository());
