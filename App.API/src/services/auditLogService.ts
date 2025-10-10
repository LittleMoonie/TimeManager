
import { AppDataSource } from '../server/database';
import { AuditLog } from '../models/auditLog';
import User from '../models/user';

export class AuditLogService {
  private auditLogRepository = AppDataSource.getRepository(AuditLog);

  public async logEvent(userId: string, action: string, entity: string, entityId: string, details?: any): Promise<void> {
    const user = new User();
    user.id = userId;

    const auditLog = new AuditLog();
    auditLog.user = user;
    auditLog.action = action;
    auditLog.entity = entity;
    auditLog.entityId = entityId;
    auditLog.details = details;

    await this.auditLogRepository.save(auditLog);
  }
}
