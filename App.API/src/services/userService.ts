import { AppDataSource } from '../server/database';
import User from '../models/user';
import { AuditLogService } from './auditLogService';
import { AuditAction } from '../models/auditLog';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private auditLogService = new AuditLogService();

  public async grantWeekendPermit(targetUserId: string, approverId: string, orgId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: targetUserId, orgId } });
    if (!user) {
      throw new Error('User not found or does not belong to your organization');
    }

    // Logic to grant weekend permit (e.g., update a field in User model)
    // For now, let's just log it
    await this.auditLogService.logEvent(approverId, orgId, AuditAction.UPDATE, 'User', targetUserId, { action: 'granted weekend permit' });

    return user;
  }

  public async retroEdit(targetUserId: string, approverId: string, orgId: string, changes: Record<string, any>): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: targetUserId, orgId } });
    if (!user) {
      throw new Error('User not found or does not belong to your organization');
    }

    // Logic to apply retroactive edits (e.g., update user fields)
    Object.assign(user, changes);
    const updatedUser = await this.userRepository.save(user);

    await this.auditLogService.logEvent(approverId, orgId, AuditAction.UPDATE, 'User', targetUserId, { action: 'retroactive edit', changes });

    return updatedUser;
  }
}
