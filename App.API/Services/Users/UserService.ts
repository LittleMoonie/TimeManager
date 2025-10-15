import * as argon2 from 'argon2';
import { validate } from 'class-validator';
import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';

import {
  CreateUserDto,
  UpdateUserDto,
  UpdateSelfDto,
  ChangePasswordDto,
  ListUsersQueryDto,
  ActiveSessionResponseDto,
  RevokeUserSessionDto,
} from '../../Dtos/Users/UserDto';
import { UserResponseDto } from '../../Dtos/Users/UserResponseDto';
import { UserStatusResponseDto } from '../../Dtos/Users/UserStatusDto';
import { Company } from '../../Entities/Companies/Company';
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
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    private readonly roleService: RoleService,
    private readonly rolePermissionService: RolePermissionService,
    private readonly activeSessionRepository: ActiveSessionRepository,
  ) {}

  private get userStatusRepository(): Repository<UserStatus> {
    return getInitializedDataSource().getRepository(UserStatus);
  }

  private get roleRepository(): Repository<Role> {
    return getInitializedDataSource().getRepository(Role);
  }

  // #region HELPERS
  /**
   * @description Ensures that the current user has a specific permission.
   * @param {User} user The user whose permissions are to be checked.
   * @param {string} permission The name of the permission to check for.
   * @returns {Promise<void>} A Promise that resolves if the user has the permission.
   * @throws {ForbiddenError} If the user does not have the required permission.
   */
  private async ensurePermission(user: User, permission: string): Promise<void> {
    const allowed = await this.rolePermissionService.checkPermission(user, permission);
    if (!allowed) throw new ForbiddenError(`Missing permission: ${permission}`);
  }

  /**
   * @description Ensures that a given DTO (Data Transfer Object) is valid by performing class-validator validation.
   * @param {unknown} dto The DTO object to validate.
   * @returns {Promise<void>} A Promise that resolves if validation passes.
   * @throws {UnprocessableEntityError} If validation fails, containing details of the validation errors.
   */
  private async ensureValidation(dto: unknown): Promise<void> {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(', ')}`,
      );
    }
  }

  private toCompanyResponse(company: Company | undefined) {
    if (!company) return undefined;
    return {
      id: company.id,
      name: company.name,
      timezone: company.timezone ?? undefined,
    };
  }

  private toRoleResponse(role: Role | undefined) {
    if (!role) return undefined;
    return {
      id: role.id,
      name: role.name,
      description: role.description ?? undefined,
      companyId: role.companyId,
    };
  }

  private toStatusResponse(status: UserStatus | undefined): UserStatusResponseDto | undefined {
    if (!status) return undefined;
    return {
      id: status.id,
      code: status.code,
      name: status.name,
      description: status.description ?? undefined,
      canLogin: status.canLogin,
      isTerminal: status.isTerminal,
    };
  }

  /**
   * @description Converts a User entity to a UserResponseDto.
   * @param {User} user The User entity to convert.
   * @param {{ withPermissions?: boolean }} [options] Optional: { withPermissions: boolean } to include user permissions.
   * @returns {Promise<UserResponseDto>} The converted UserResponseDto.
   */
  private async toResponse(
    user: User,
    options?: { withPermissions?: boolean },
  ): Promise<UserResponseDto> {
    const response: UserResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.companyId,
      company: this.toCompanyResponse(user.company),
      roleId: user.roleId,
      role: this.toRoleResponse(user.role),
      statusId: user.statusId,
      status: this.toStatusResponse(user.status),
      createdAt: user.createdAt,
      phoneNumber: user.phoneNumber ?? undefined,
      lastLogin: user.lastLogin ?? undefined,
      deletedAt: user.deletedAt ?? undefined,
    };

    if (options?.withPermissions) {
      response.permissions = await this.rolePermissionService.getPermissionsForRole(
        user.roleId,
        user.companyId,
      );
    }

    return response;
  }
  // #endregion

  // #region GET
  /**
   * @description Retrieves the profile of the currently authenticated user.
   * @permission `user.view.self`
   * @param {User} currentUser The currently authenticated user.
   * @returns {Promise<UserResponseDto>} The user's profile information.
   */
  async getCurrentUser(currentUser: User): Promise<UserResponseDto> {
    await this.ensurePermission(currentUser, 'user.view.self');
    const user = await this.userRepository.findById(currentUser.id);
    if (!user) throw new NotFoundError('User not found');
    return this.toResponse(user, { withPermissions: true });
  }

  /**
   * @description Retrieves a single user by their ID. This is an admin-only action.
   * @permission `admin.user.view`
   * @param {string} userId The ID of the user to retrieve.
   * @param {User} currentUser The user performing the action.
   * @returns {Promise<UserResponseDto>} The requested user's information.
   */
  async getUserById(userId: string, currentUser: User): Promise<UserResponseDto> {
    await this.ensurePermission(currentUser, 'admin.user.view');
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return this.toResponse(user, { withPermissions: true });
  }

  /**
   * @description Retrieves a single user by their ID within a specific company. This is a manager-level action.
   * @permission `manager.user.view`
   * @param {string} userId The ID of the user to retrieve.
   * @param {string} companyId The ID of the company the user belongs to.
   * @param {User} currentUser The user performing the action.
   * @returns {Promise<UserResponseDto>} The requested user's information.
   */
  async getUserByIdInCompany(
    userId: string,
    companyId: string,
    currentUser: User,
  ): Promise<UserResponseDto> {
    await this.ensurePermission(currentUser, 'manager.user.view');
    if (currentUser.companyId !== companyId) {
      throw new ForbiddenError('You can only view users in your own company.');
    }
    const user = await this.userRepository.findByIdInCompany(userId, companyId);
    if (!user) throw new NotFoundError('User not found in this company');
    return this.toResponse(user, { withPermissions: true });
  }

  /**
   * @description Retrieves a paginated list of all users in the system. This is an admin-only action.
   * @permission `admin.user.list`
   * @param {ListUsersQueryDto} query Query parameters for pagination.
   * @param {User} currentUser The user performing the action.
   * @returns {Promise<{ data: UserResponseDto[]; total: number; page: number; limit: number }>} A paginated list of users.
   */
  async getUsers(query: ListUsersQueryDto, currentUser: User) {
    await this.ensurePermission(currentUser, 'admin.user.list');
    const { page = 1, limit = 25 } = query;
    const { data, total } = await this.userRepository.findPaginated(page, limit);
    return {
      data: await Promise.all(data.map((u) => this.toResponse(u))),
      total,
      page,
      limit,
    };
  }

  /**
   * @description Retrieves a paginated list of users within a specific company. This is a manager-level action.
   * @permission `manager.user.list`
   * @param {string} companyId The ID of the company to retrieve users from.
   * @param {ListUsersQueryDto} query Query parameters for pagination and filtering.
   * @param {User} currentUser The user performing the action.
   * @returns {Promise<{ data: UserResponseDto[]; total: number; page: number; limit: number }>} A paginated list of users.
   */
  async getUsersInCompany(companyId: string, query: ListUsersQueryDto, currentUser: User) {
    await this.ensurePermission(currentUser, 'manager.user.list');
    if (currentUser.companyId !== companyId) {
      throw new ForbiddenError('You can only list users in your own company.');
    }
    const { page = 1, limit = 25, q, roleId, statusId } = query;
    const { data, total } = await this.userRepository.findPaginatedByCompany(
      companyId,
      page,
      limit,
      { q, roleId, statusId },
    );
    return {
      data: await Promise.all(data.map((u) => this.toResponse(u))),
      total,
      page,
      limit,
    };
  }
  // #endregion

  // #region CREATE
  /**
   * @description Creates a new user.
   * @permission `admin.user.create` or `manager.user.create`
   * @param {CreateUserDto} dto The data to create the user with.
   * @param {User} currentUser The user performing the action.
   * @returns {Promise<UserResponseDto>} The newly created user.
   */
  async createUser(dto: CreateUserDto, currentUser: User): Promise<UserResponseDto> {
    await this.ensureValidation(dto);

    const canAdminCreate = await this.rolePermissionService.checkPermission(
      currentUser,
      'admin.user.create',
    );
    const canManagerCreate = await this.rolePermissionService.checkPermission(
      currentUser,
      'manager.user.create',
    );

    if (!canAdminCreate && !canManagerCreate) {
      throw new ForbiddenError('Missing permission to create user.');
    }

    let companyId = dto.companyId;
    if (canManagerCreate && !canAdminCreate) {
      if (dto.companyId !== currentUser.companyId) {
        throw new ForbiddenError('You can only create users in your own company.');
      }
      companyId = currentUser.companyId;
    }

    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new UnprocessableEntityError('A user with this email already exists.');
    }

    const passwordHash = await argon2.hash(dto.password);

    const role = await this.roleRepository.findOne({ where: { id: dto.roleId, companyId } });
    if (!role) {
      throw new UnprocessableEntityError('Invalid role.');
    }

    const activeStatus = await this.userStatusRepository.findOne({ where: { code: 'ACTIVE' } });
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
  // #endregion

  // #region UPDATE
  /**
   * @description Updates the currently authenticated user's profile.
   * @permission `user.update.self`
   * @param {UpdateSelfDto} dto The data to update the user's profile with.
   * @param {User} currentUser The currently authenticated user.
   * @returns {Promise<UserResponseDto>} The updated user profile.
   */
  async updateProfile(dto: UpdateSelfDto, currentUser: User): Promise<UserResponseDto> {
    await this.ensureValidation(dto);
    await this.ensurePermission(currentUser, 'user.update.self');

    const userToUpdate = await this.userRepository.findById(currentUser.id);
    if (!userToUpdate) throw new NotFoundError('User not found');

    await this.userRepository.update(currentUser.id, dto);

    const reloaded = await this.userRepository.findById(currentUser.id);
    if (!reloaded) throw new NotFoundError('User not found after update');

    return this.toResponse(reloaded);
  }

  /**
   * @description Updates a user's information. This is an admin/manager action.
   * @permission `admin.user.update` or `manager.user.update`
   * @param {string} userId The ID of the user to update.
   * @param {UpdateUserDto} dto The data to update the user with.
   * @param {User} currentUser The user performing the action.
   * @returns {Promise<UserResponseDto>} The updated user.
   */
  async updateUser(
    userId: string,
    dto: UpdateUserDto,
    currentUser: User,
  ): Promise<UserResponseDto> {
    await this.ensureValidation(dto);

    const userToUpdate = await this.userRepository.findById(userId, true);
    if (!userToUpdate) throw new NotFoundError('User not found');

    const canAdminUpdate = await this.rolePermissionService.checkPermission(
      currentUser,
      'admin.user.update',
    );
    const canManagerUpdate = await this.rolePermissionService.checkPermission(
      currentUser,
      'manager.user.update',
    );

    if (!canAdminUpdate && !canManagerUpdate) {
      throw new ForbiddenError('Missing permission to update user.');
    }

    if (canManagerUpdate && !canAdminUpdate) {
      if (userToUpdate.companyId !== currentUser.companyId) {
        throw new ForbiddenError('You can only update users in your own company.');
      }
      // Managers cannot change role, status, or company
      if (dto.roleId || dto.statusId || dto.companyId) {
        throw new ForbiddenError('You do not have permission to change role, status, or company.');
      }
    }
    await this.userRepository.update(userId, dto);

    const reloaded = await this.userRepository.findById(userId, true);
    if (!reloaded) throw new NotFoundError('User not found after update');

    return this.toResponse(reloaded);
  }

  /**
   * @description Changes the currently authenticated user's password.
   * @param {User} currentUser The currently authenticated user.
   * @param {ChangePasswordDto} dto The current and new password data.
   * @returns {Promise<void>}
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
  // #endregion

  // #region DELETE
  /**
   * @description Anonymizes a user, effectively deleting them. This is a permanent action.
   * @permission `admin.user.delete` or `manager.user.delete`
   * @param {string} userId The ID of the user to delete.
   * @param {User} currentUser The user performing the action.
   * @returns {Promise<void>}
   */
  async deleteUser(userId: string, currentUser: User): Promise<void> {
    const userToDelete = await this.userRepository.findById(userId);
    if (!userToDelete) throw new NotFoundError('User not found');

    const canAdminDelete = await this.rolePermissionService.checkPermission(
      currentUser,
      'admin.user.delete',
    );
    const canManagerDelete = await this.rolePermissionService.checkPermission(
      currentUser,
      'manager.user.delete',
    );

    if (!canAdminDelete && !canManagerDelete) {
      throw new ForbiddenError('Missing permission to delete user.');
    }

    if (canManagerDelete && !canAdminDelete) {
      if (userToDelete.companyId !== currentUser.companyId) {
        throw new ForbiddenError('You can only delete users in your own company.');
      }
    }

    await this.userRepository.anonymize(userId);
  }
  // #endregion

  // #region SESSIONS
  /**
   * @description Lists the active sessions for a given user.
   * @permission `view_user_sessions` if viewing another user's sessions.
   * @param {string} companyId The ID of the company.
   * @param {User} currentUser The user performing the action.
   * @param {string} [userId] The ID of the user whose sessions to list. Defaults to the current user.
   * @returns {Promise<ActiveSessionResponseDto[]>} A list of active sessions.
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
    const sessions = await this.activeSessionRepository.getAllActiveSessionsForUser(
      companyId,
      targetUserId,
    );
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

  /**
   * @description Revokes a specific user session by its ID.
   * @permission `revoke_session`
   * @param {string} companyId The ID of the company the session belongs to.
   * @param {User} currentUser The user performing the action.
   * @param {RevokeUserSessionDto} dto The session ID to revoke.
   * @returns {Promise<void>}
   */
  async revokeUserSessionById(
    companyId: string,
    currentUser: User,
    dto: RevokeUserSessionDto,
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
  // #endregion
}
