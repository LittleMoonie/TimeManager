import { AuditLog } from '../../Entities/Logs/Actions/AuditLog';
import { DataLogAction } from '../../Entities/Logs/Data/DataLog';
import { Inject, Service } from 'typedi';
import { AuditLogRepository } from '../../Repositories/Logs/AuditLogRepository';

export class AuditLogService {
  constructor(@Inject("AuditLogRepository") private readonly auditLogRepository: AuditLogRepository) {}

  public async logEvent(
    actorUserId: string,
    companyId: string,
    action: DataLogAction,
    entity: string,
    entityId: string,
    details?: Record<string, string>,
  ): Promise<void> {
    const auditLog = new AuditLog();
    auditLog.actorUserId = actorUserId;
    auditLog.companyId = companyId;
    auditLog.action = action;
    auditLog.entity = entity;
    auditLog.entityId = entityId;
    auditLog.diff = details;

    await this.auditLogRepository.save(auditLog);
  }
}
