import Container, { Service } from 'typedi';
import { DataLog } from '../../../Entities/Logs/Data/DataLog';
import { BaseRepository } from '../../BaseRepository';

export class DataLogRepository extends BaseRepository<DataLog> {
  constructor() {
    super(DataLog);
  }
}

Container.set('DataLogRepository', new DataLogRepository());
