
import { AppDataSource } from '../server/database';
import { AuditLog, AuditAction } from '../models/auditLog';

export class AuditLogService {
  private auditLogRepository = AppDataSource.getRepository(AuditLog);

  public async logEvent(actorUserId: string, orgId: string, action: AuditAction, entity: string, entityId: string, details?: Record<string, any>): Promise<void> {
    const auditLog = new AuditLog();
    auditLog.actorUserId = actorUserId;
    auditLog.orgId = orgId;
    auditLog.action = action;
    auditLog.entity = entity;
    auditLog.entityId = entityId;
    auditLog.diff = details;

    await this.auditLogRepository.save(auditLog);
  }
}
