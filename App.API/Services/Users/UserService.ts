import * as argon2 from 'argon2';
import { validate } from 'class-validator';
import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';

import {
  CreateUserDto,
  UpdateUserDto,
  UpdateMeDto,
  ChangePasswordDto,
  ListUsersQueryDto,
  RevokeSessionDto,
  ActiveSessionResponseDto,
} from '../../Dtos/Users/UserDto';
import { UserResponseDto } from '../../Dtos/Users/UserResponseDto';
import { UserStatusResponseDto } from '../../Dtos/Users/UserStatusDto';
import { Role } from '../../Entities/Roles/Role';
import User from '../../Entities/Users/User';
import { UserStatus } from '../../Entities/Users/UserStatus';
import { UnprocessableEntityError, NotFoundError, ForbiddenError } from '../../Errors/HttpErrors';
import { ActiveSessionRepository } from '../../Repositories/Users/ActiveSessionRepository';
import { UserRepository } from '../../Repositories/Users/UserRepository';
import { getInitializedDataSource } from '../../Server/Database';
import { RolePermissionService } from '../../Services/RoleService/RolePermissionService';
import { RoleService } from '../../Services/RoleService/RoleService';

/**
 * @description Service layer for managing User entities. This service provides business logic
 * for user-related operations, including CRUD, profile updates, password changes, and session management,
 * with integrated permission checks and DTO conversions.
 */
@Service()
export class UserService {
  /**
   * @description Initializes the UserService with necessary repositories and services.
   * @param userRepository The repository for User entities.
   * @param userStatusRepository The TypeORM repository for UserStatus entities.
   * @param roleRepository The TypeORM repository for Role entities.
   * @param roleService The service for managing roles.
   * @param rolePermissionService The service for checking user permissions.
   * @param activeSessionRepository The repository for ActiveSession entities.
   */
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    @Inject('RoleService') private readonly roleService: RoleService,
    @Inject('RolePermissionService') private readonly rolePermissionService: RolePermissionService,
    @Inject('ActiveSessionRepository') private readonly activeSessionRepository: ActiveSessionRepository,
  ) {}

  private get userStatusRepository(): Repository<UserStatus> {
    return getInitializedDataSource().getRepository(UserStatus);
  }

  private get roleRepository(): Repository<Role> {
    return getInitializedDataSource().getRepository(Role);
  }

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------
  /**
   * @description Ensures that the current user has a specific permission.
   * @param user The user whose permissions are to be checked.
   * @param permission The name of the permission to check for.
   * @returns A Promise that resolves if the user has the permission.
   * @throws {ForbiddenError} If the user does not have the required permission.
   */
  private async ensurePermission(user: User, permission: string) {
    const allowed = await this.rolePermissionService.checkPermission(user, permission);
    if (!allowed) throw new ForbiddenError(`Missing permission: ${permission}`);
  }

  /**
   * @description Ensures that a given DTO (Data Transfer Object) is valid by performing class-validator validation.
   * @param dto The DTO object to validate.
   * @returns A Promise that resolves if validation passes.
   * @throws {UnprocessableEntityError} If validation fails, containing details of the validation errors.
   */
  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(', ')}`,
      );
    }
  }

  /**
   * @description Converts a User entity to a UserResponseDto.
   * @param user The User entity to convert.
   * @returns The converted UserResponseDto.
   */
  private toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.companyId,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            timezone: user.company.timezone ?? undefined,
          }
        : undefined,
      roleId: user.roleId,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description ?? undefined,
            companyId: user.role.companyId,
          }
        : undefined,
      statusId: user.statusId,
      status: user.status
        ? ({
            id: user.status.id,
            code: user.status.code,
            name: user.status.name,
            description: user.status.description ?? undefined,
            canLogin: user.status.canLogin,
            isTerminal: user.status.isTerminal,
          } as UserStatusResponseDto)
        : undefined,
      createdAt: user.createdAt,
      phoneNumber: user.phoneNumber ?? undefined,
      lastLogin: user.lastLogin ?? undefined,
      deletedAt: user.deletedAt ?? undefined,
    };
  }

  // -------------------------------------------------------------------
  // CRUD
  // -------------------------------------------------------------------
  /**
   * @description Creates a new user within a specified company. Requires 'create_user' permission.
   * @param companyId The unique identifier of the company where the user will be created.
   * @param currentUser The user performing the action.
   * @param dto The CreateUserDto containing the new user's details.
   * @returns A Promise that resolves to the newly created UserResponseDto.
   * @throws {ForbiddenError} If the current user does not have 'create_user' permission.
   * @throws {UnprocessableEntityError} If validation fails, the email already exists in the company, or an invalid roleId is provided.
   * @throws {NotFoundError} If the user is not found after creation (should not happen under normal circumstances).
   */
  async createUser(
    companyId: string,
    currentUser: User,
    dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    await this.ensurePermission(currentUser, 'create_user');
    await this.ensureValidation(dto);

    // Unique email per company
    const existing = await this.userRepository.findByEmailInCompany(dto.email, companyId);
    if (existing) {
      throw new UnprocessableEntityError('A user with this email already exists in the company.');
    }

    const passwordHash = await argon2.hash(dto.password);

    // Validate role in company
    const role = await this.roleRepository.findOne({
      where: { id: dto.roleId, companyId },
    });
    if (!role) {
      throw new UnprocessableEntityError('Invalid roleId for this company.');
    }

    const activeStatus = await this.userStatusRepository.findOne({
      where: { code: 'ACTIVE' },
    });
    if (!activeStatus) {
      throw new NotFoundError('Active user status not found.');
    }

    const user = await this.userRepository.create({
      companyId,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      roleId: dto.roleId,
      phoneNumber: dto.phoneNumber,
      statusId: activeStatus.id,
    } as User);

    const created = await this.userRepository.findByIdInCompany(user.id, companyId);
    if (!created) throw new NotFoundError('User not found after creation.');

    return this.toResponse(created);
  }

  /**
   * @description Retrieves a single user's details within a specific company scope.
   * Requires 'view_user' permission if the target user is not the current user.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user to retrieve.
   * @param currentUser The user performing the action.
   * @returns A Promise that resolves to the UserResponseDto of the requested user.
   * @throws {ForbiddenError} If the current user does not have 'view_user' permission and is not the target user.
   * @throws {NotFoundError} If the user is not found within the specified company.
   */
  async getUserById(
    companyId: string,
    userId: string,
    currentUser: User,
  ): Promise<UserResponseDto> {
    // View permission or self
    if (currentUser.id !== userId) {
      await this.ensurePermission(currentUser, 'view_user');
    }
    const user = await this.userRepository.findByIdInCompany(userId, companyId);
    if (!user) throw new NotFoundError('User not found');
    return this.toResponse(user);
  }

  /**
   * @description Lists users within a specific company scope, with optional pagination and filtering.
   * Requires 'list_users' permission.
   * @param companyId The unique identifier of the company.
   * @param currentUser The user performing the action.
   * @param query The ListUsersQueryDto containing pagination and filter parameters.
   * @returns A Promise that resolves to an object containing paginated user data (UserResponseDto[]), total count, page, and limit.
   * @throws {ForbiddenError} If the current user does not have 'list_users' permission.
   */
  async listUsers(
    companyId: string,
    currentUser: User,
    query: ListUsersQueryDto,
  ): Promise<{
    data: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    await this.ensurePermission(currentUser, 'list_users');

    const page = query.page ?? 1;
    const limit = query.limit ?? 25;

    // Basic pagination using repository helper; filtering can be extended
    const { data } = await this.userRepository.findPaginated(page, limit);
    const scoped = data.filter((u) => u.companyId === companyId);

    return {
      data: scoped.map((u) => this.toResponse(u)),
      total: scoped.length, // If you need precise total per company, implement a scoped findAndCount
      page,
      limit,
    };
    // NOTE: For large datasets, add a dedicated scoped paginate in the repository.
  }

  /**
   * @description Updates an existing user's details within a specific company. Requires 'update_user' permission,
   * unless the user is updating their own limited fields.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user to update.
   * @param currentUser The user performing the action.
   * @param dto The UpdateUserDto containing the updated user details.
   * @returns A Promise that resolves to the updated UserResponseDto.
   * @throws {ForbiddenError} If the current user lacks permission or attempts to change restricted fields for themselves.
   * @throws {UnprocessableEntityError} If validation fails, or an invalid roleId/statusId is provided.
   * @throws {NotFoundError} If the user is not found.
   */
  async updateUser(
    companyId: string,
    userId: string,
    currentUser: User,
    dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // Self can update limited fields; others require permission
    const updatingSelf = currentUser.id === userId;
    if (!updatingSelf) {
      await this.ensurePermission(currentUser, 'update_user');
    }

    await this.ensureValidation(dto);

    const user = await this.userRepository.findByIdInCompany(userId, companyId, true);
    if (!user) throw new NotFoundError('User not found');

    // If role/status/company updates are attempted by self, forbid
    if (updatingSelf && (dto.roleId || dto.statusId || dto.companyId)) {
      throw new ForbiddenError('You cannot change your own role, status or company.');
    }

    // Company change (admin action)
    if (dto.companyId && dto.companyId !== user.companyId) {
      await this.ensurePermission(currentUser, 'move_user_company');
      user.companyId = dto.companyId;
    }

    if (dto.email !== undefined) user.email = dto.email;
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;

    if (dto.password) {
      user.passwordHash = await argon2.hash(dto.password);
      user.mustChangePasswordAtNextLogin = false;
    }

    if (dto.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: dto.roleId, companyId: user.companyId },
      });
      if (!role) throw new UnprocessableEntityError('Invalid roleId for this company.');
      user.roleId = dto.roleId;
    }

    if (dto.statusId) {
      const status = await this.userStatusRepository.findOne({
        where: { id: dto.statusId },
      });
      if (!status) throw new UnprocessableEntityError('Invalid statusId.');
      user.statusId = dto.statusId;
    }

    if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber;

    await this.userRepository.save(user);

    const reloaded = await this.userRepository.findByIdInCompany(user.id, user.companyId, true);
    if (!reloaded) throw new NotFoundError('User not found after update');

    return this.toResponse(reloaded);
  }

  /**
   * @description Allows a user to update their own profile information (limited fields).
   * @param currentUser The user performing the action.
   * @param dto The UpdateMeDto containing the updated profile details.
   * @returns A Promise that resolves to the updated UserResponseDto.
   * @throws {UnprocessableEntityError} If validation fails.
   * @throws {NotFoundError} If the current user is not found.
   */
  async updateMe(currentUser: User, dto: UpdateMeDto): Promise<UserResponseDto> {
    await this.ensureValidation(dto);
    const user = await this.userRepository.findById(currentUser.id);
    if (!user) throw new NotFoundError('User not found');

    if (dto.email !== undefined) user.email = dto.email;
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber;

    await this.userRepository.save(user);

    const reloaded = await this.userRepository.findByIdInCompany(user.id, user.companyId);
    if (!reloaded) throw new NotFoundError('User not found after update');

    return this.toResponse(reloaded);
  }

  /**
   * @description Allows a user to change their own password.
   * @param currentUser The user performing the action.
   * @param dto The ChangePasswordDto containing the current and new passwords.
   * @returns A Promise that resolves when the password change is complete.
   * @throws {UnprocessableEntityError} If validation fails.
   * @throws {NotFoundError} If the current user is not found.
   * @throws {ForbiddenError} If the current password provided is incorrect.
   */
  async changePassword(currentUser: User, dto: ChangePasswordDto): Promise<void> {
    await this.ensureValidation(dto);

    const user = await this.userRepository.findById(currentUser.id);
    if (!user) throw new NotFoundError('User not found');

    const ok = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!ok) throw new ForbiddenError('Current password is incorrect');

    user.passwordHash = await argon2.hash(dto.newPassword);
    user.mustChangePasswordAtNextLogin = false;

    await this.userRepository.save(user);
  }

  /**
   * @description Permanently deletes a user from the database. Requires 'delete_user' permission.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user to hard delete.
   * @param currentUser The user performing the action.
   * @returns A Promise that resolves when the deletion is complete.
   * @throws {ForbiddenError} If the current user does not have 'delete_user' permission.
   * @throws {NotFoundError} If the user is not found.
   */
  async hardDeleteUser(companyId: string, userId: string, currentUser: User): Promise<void> {
    await this.ensurePermission(currentUser, 'delete_user');
    const target = await this.userRepository.findByIdInCompany(userId, companyId, true);
    if (!target) throw new NotFoundError('User not found');
    await this.userRepository.hardDelete(userId);
  }

  /**
   * @description Soft deletes a user, marking them as deleted but retaining their record. Requires 'delete_user' permission.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user to soft delete.
   * @param currentUser The user performing the action.
   * @returns A Promise that resolves when the soft deletion is complete.
   * @throws {ForbiddenError} If the current user does not have 'delete_user' permission.
   * @throws {NotFoundError} If the user is not found.
   */
  async softDeleteUser(companyId: string, userId: string, currentUser: User): Promise<void> {
    await this.ensurePermission(currentUser, 'delete_user');
    const target = await this.userRepository.findByIdInCompany(userId, companyId);
    if (!target) throw new NotFoundError('User not found');
    await this.userRepository.softDelete(userId);
  }

  /**
   * @description Restores a soft-deleted user. Requires 'restore_user' permission.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user to restore.
   * @param currentUser The user performing the action.
   * @returns A Promise that resolves when the restoration is complete.
   * @throws {ForbiddenError} If the current user does not have 'restore_user' permission.
   * @throws {NotFoundError} If the user is not found.
   */
  async restoreUser(companyId: string, userId: string, currentUser: User): Promise<void> {
    await this.ensurePermission(currentUser, 'restore_user');
    const target = await this.userRepository.findByIdInCompany(userId, companyId, true);
    if (!target) throw new NotFoundError('User not found');
    await this.userRepository.restore(userId);
  }

  /**
   * @description Revokes a specific active session by its ID. Requires 'revoke_session' permission.
   * @param companyId The unique identifier of the company.
   * @param currentUser The user performing the action.
   * @param dto The RevokeSessionDto containing the session ID to revoke.
   * @returns A Promise that resolves when the session revocation is complete.
   * @throws {ForbiddenError} If the current user does not have 'revoke_session' permission.
   * @throws {NotFoundError} If the session is not found or does not belong to the specified company.
   */
  async revokeSessionById(
    companyId: string,
    currentUser: User,
    dto: RevokeSessionDto,
  ): Promise<void> {
    await this.ensurePermission(currentUser, 'revoke_session');

    const session = await this.activeSessionRepository.findById(dto.sessionId);
    if (!session || session.companyId !== companyId) {
      throw new NotFoundError('Session not found');
    }
    await this.activeSessionRepository.update(session.id, {
      revokedAt: new Date(),
    });
  }

  /**
   * @description Lists all active sessions for a user within a specific company. Requires 'view_user_sessions' permission
   * if the target user is not the current user.
   * @param companyId The unique identifier of the company.
   * @param currentUser The user performing the action.
   * @param userId Optional: The unique identifier of the target user. If not provided, defaults to the `currentUser.id`.
   * @returns A Promise that resolves to an array of ActiveSessionResponseDto objects.
   * @throws {ForbiddenError} If the current user does not have 'view_user_sessions' permission and is not the target user.
   */
  async listUserSessions(
    companyId: string,
    currentUser: User,
    userId?: string,
  ): Promise<ActiveSessionResponseDto[]> {
    const targetUserId = userId ?? currentUser.id;
    if (targetUserId !== currentUser.id) {
      await this.ensurePermission(currentUser, 'view_user_sessions');
    }
    const sessions = await this.activeSessionRepository.findAllForUser(companyId, targetUserId);
    return sessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      companyId: s.companyId,
      ip: s.ip ?? undefined,
      userAgent: s.userAgent ?? undefined,
      deviceId: s.deviceId ?? undefined,
      lastSeenAt: s.lastSeenAt ?? undefined,
      createdAt: s.createdAt ?? undefined,
      expiresAt: s.expiresAt ?? undefined,
      revokedAt: s.revokedAt ?? undefined,
    }));
  }
}
