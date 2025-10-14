import Container, { Service } from 'typedi';

import { AuditLog } from '../../Entities/Logs/Actions/AuditLog';
import { BaseRepository } from '../BaseRepository';

@Service('AuditLogRepository')
export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor() {
    super(AuditLog);
  }
}

Container.set('AuditLogRepository', new AuditLogRepository());
