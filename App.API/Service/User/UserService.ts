import { AppDataSource } from '../../Server/Database';
import User from '../../Entity/Users/User';
import { AuditLogService } from '../Logs/AuditLogService';
import { AuditAction } from '../../Entity/Logs/AuditLog';
import { CreateUserDto } from '../../Dto/Users/CreateUserDto';
import { UpdateUserDto } from '../../Dto/Users/UpdateUserDto';
import { Role } from '../../Entity/Users/Role';
import { UserStatus } from '../../Entity/Users/UserStatus';
import bcrypt from 'bcryptjs';
import { Organization } from '../../Entity/Company/Company';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private orgRepository = AppDataSource.getRepository(Organization);
  private auditLogService = new AuditLogService();

  public async createUser(createUserData: CreateUserDto, actingUserId: string, actingUserRole: Role): Promise<User> {
    const { email, name, password, role, orgId } = createUserData;

    if (actingUserRole === Role.MANAGER && role === Role.ADMIN) {
      throw new Error('Manager cannot create Admin users');
    }

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let organization: Organization | null = null;
    if (orgId) {
      organization = await this.orgRepository.findOne({ where: { id: orgId } });
      if (!organization) {
        throw new Error('Organization not found');
      }
    } else if (actingUserRole === Role.ADMIN) {
      // Admin can create a new organization if orgId is not provided
      organization = this.orgRepository.create({ name: `${name}'s Organization` });
      await this.orgRepository.save(organization);
    } else {
      throw new Error('Organization ID is required for non-admin users');
    }

    const newUser = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
      role,
      orgId: organization.id,
      organization: organization,
      status: UserStatus.ACTIVE, // Default status
    });

    const savedUser = await this.userRepository.save(newUser);
    await this.auditLogService.logEvent(actingUserId, savedUser.orgId, AuditAction.CREATE, 'User', savedUser.id, { createdUserEmail: savedUser.email });

    return savedUser;
  }

  public async getUserById(userId: string, orgId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId, orgId } });
  }

  public async updateUser(userId: string, updateUserData: UpdateUserDto, actingUserId: string, actingUserRole: Role, orgId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId, orgId } });
    if (!user) {
      throw new Error('User not found');
    }

    if (updateUserData.role && actingUserRole === Role.MANAGER && updateUserData.role === Role.ADMIN) {
      throw new Error('Manager cannot change user role to Admin');
    }

    if (updateUserData.password) {
      updateUserData.password = await bcrypt.hash(updateUserData.password, 10);
    }

    Object.assign(user, updateUserData);
    const updatedUser = await this.userRepository.save(user);
    await this.auditLogService.logEvent(actingUserId, orgId, AuditAction.UPDATE, 'User', userId, { updatedFields: Object.keys(updateUserData) });

    return updatedUser;
  }

  public async deleteUser(userId: string, actingUserId: string, actingUserRole: Role, orgId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId, orgId } });
    if (!user) {
      throw new Error('User not found');
    }

    if (actingUserRole === Role.MANAGER && user.role === Role.ADMIN) {
      throw new Error('Manager cannot delete Admin users');
    }

    await this.userRepository.remove(user);
    await this.auditLogService.logEvent(actingUserId, orgId, AuditAction.DELETE, 'User', userId, { deletedUserEmail: user.email });
  }

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

  public async retroEdit(targetUserId: string, approverId: string, orgId: string, changes: Record<string, string>): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: targetUserId, orgId } });
    if (!user) {
      throw new Error('User not found or does not belong to your organization');
    }

    // Logic to apply retroactive edits (e.g., update user fields)
    Object.assign(user, changes);
    const updatedUser = await this.userRepository.save(user);

    await this.auditLogService.logEvent(approverId, orgId, AuditAction.UPDATE, 'User', targetUserId, { action: 'retroactive edit', changes } as unknown as Record<string, string>);

    return updatedUser;
  }
}
