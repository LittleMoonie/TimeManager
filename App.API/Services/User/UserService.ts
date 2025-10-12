import {
  UnprocessableEntityError,
  NotFoundError,
  ForbiddenError,
} from "@/Errors/HttpErrors";
import { validate } from "class-validator";
import * as argon2 from "argon2";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";

import { UserRepository } from "@/Repositories/Users/UserRepository";
import { ActiveSessionRepository } from "@/Repositories/Users/ActiveSessionRepository";

import {
  CreateUserDto,
  UpdateUserDto,
  UpdateMeDto,
  ChangePasswordDto,
  ListUsersQueryDto,
  RevokeSessionDto,
  ActiveSessionResponseDto,
} from "@/Dtos/Users/UserDto";

import { UserResponseDto } from "@/Dtos/Users/UserResponseDto";

import User from "@Entities/Users/User";
import { UserStatus } from "@/Entities/Users/UserStatus";
import { Role } from "@Entities/Roles/Role";

import { RoleService } from "@Services/RoleService/RoleService";
import { RolePermissionService } from "@Services/RoleService/RolePermissionService";
import { UserStatusResponseDto } from "@/Dtos/Users/UserStatusDto";

@Service()
export class UserService {
  constructor(
    // Inject custom repository (DI)
    private readonly userRepository: UserRepository,

    @InjectRepository(UserStatus)
    private readonly userStatusRepository: Repository<UserStatus>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private readonly roleService: RoleService,
    private readonly rolePermissionService: RolePermissionService,

    private readonly activeSessionRepository: ActiveSessionRepository,
  ) {}

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------
  private async ensurePermission(user: User, permission: string) {
    const allowed = await this.rolePermissionService.checkPermission(user, permission);
    if (!allowed) throw new ForbiddenError(`Missing permission: ${permission}`);
  }

  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map(e => e.toString()).join(", ")}`
      );
    }
  }

  private toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.companyId,
      company: user.company
        ? { id: user.company.id, name: user.company.name, timezone: user.company.timezone ?? undefined }
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
        ? {
            id: user.status.id,
            code: user.status.code,
            name: user.status.name,
            description: user.status.description ?? undefined,
            canLogin: user.status.canLogin,
            isTerminal: user.status.isTerminal,
          } as UserStatusResponseDto
        : undefined,
      createdAt: user.createdAt,
      phoneNumber: user.phoneNumber ?? undefined,
      lastLogin: user.lastLogin ?? undefined,
      deletedAt: user.deletedAt ?? undefined,
    };
  }

  /**
   * @description Gets a user by its ID.
   * @param userId The unique identifier of the user to get.
   * @returns A Promise that resolves to the User entity.
   * @throws {NotFoundError} If the user is not found.
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  // -------------------------------------------------------------------
  // CRUD
  // -------------------------------------------------------------------
  /** Admin/manager creates a user in their company */
  async createUser(
    companyId: string,
    currentUser: User,
    dto: CreateUserDto
  ): Promise<UserResponseDto> {
    await this.ensurePermission(currentUser, "create_user");
    await this.ensureValidation(dto);

    // Unique email per company
    const existing = await this.userRepository.findByEmailInCompany(dto.email, companyId);
    if (existing) {
      throw new UnprocessableEntityError("A user with this email already exists in the company.");
    }

    const passwordHash = await argon2.hash(dto.password);

    // Validate role in company
    const role = await this.roleRepository.findOne({ where: { id: dto.roleId, companyId } });
    if (!role) {
      throw new UnprocessableEntityError("Invalid roleId for this company.");
    }

    const user = await this.userRepository.create({
      companyId,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      roleId: dto.roleId,
      phoneNumber: dto.phoneNumber,
      statusId: (await this.userStatusRepository.findOne({ where: { code: "ACTIVE" } }))?.id!,
    } as User);

    const created = await this.userRepository.findByIdInCompany(user.id, companyId);
    if (!created) throw new NotFoundError("User not found after creation.");

    return this.toResponse(created);
  }

  /** Get single user (company-scoped) */
  async getUser(
    companyId: string,
    userId: string,
    currentUser: User
  ): Promise<UserResponseDto> {
    // View permission or self
    if (currentUser.id !== userId) {
      await this.ensurePermission(currentUser, "view_user");
    }
    const user = await this.userRepository.findByIdInCompany(userId, companyId);
    if (!user) throw new NotFoundError("User not found");
    return this.toResponse(user);
  }

  /** List users (company-scoped) */
  async listUsers(
    companyId: string,
    currentUser: User,
    query: ListUsersQueryDto
  ): Promise<{ data: UserResponseDto[]; total: number; page: number; limit: number; }> {
    await this.ensurePermission(currentUser, "list_users");

    const page = query.page ?? 1;
    const limit = query.limit ?? 25;

    // Basic pagination using repository helper; filtering can be extended
    const { data, total } = await this.userRepository.findPaginated(page, limit);
    const scoped = data.filter(u => u.companyId === companyId);

    return {
      data: scoped.map(u => this.toResponse(u)),
      total: scoped.length, // If you need precise total per company, implement a scoped findAndCount
      page,
      limit,
    };
    // NOTE: For large datasets, add a dedicated scoped paginate in the repository.
  }

  /** Update a user (admin/manager or self with limited fields) */
  async updateUser(
    companyId: string,
    userId: string,
    currentUser: User,
    dto: UpdateUserDto
  ): Promise<UserResponseDto> {
    // Self can update limited fields; others require permission
    const updatingSelf = currentUser.id === userId;
    if (!updatingSelf) {
      await this.ensurePermission(currentUser, "update_user");
    }

    await this.ensureValidation(dto);

    const user = await this.userRepository.findByIdInCompany(userId, companyId, true);
    if (!user) throw new NotFoundError("User not found");

    // If role/status/company updates are attempted by self, forbid
    if (updatingSelf && (dto.roleId || dto.statusId || dto.companyId)) {
      throw new ForbiddenError("You cannot change your own role, status or company.");
    }

    // Company change (admin action)
    if (dto.companyId && dto.companyId !== user.companyId) {
      await this.ensurePermission(currentUser, "move_user_company");
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
      const role = await this.roleRepository.findOne({ where: { id: dto.roleId, companyId: user.companyId } });
      if (!role) throw new UnprocessableEntityError("Invalid roleId for this company.");
      user.roleId = dto.roleId;
    }

    if (dto.statusId) {
      const status = await this.userStatusRepository.findOne({ where: { id: dto.statusId } });
      if (!status) throw new UnprocessableEntityError("Invalid statusId.");
      user.statusId = dto.statusId;
    }

    if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber;

    await this.userRepository.save(user);

    const reloaded = await this.userRepository.findByIdInCompany(user.id, user.companyId, true);
    if (!reloaded) throw new NotFoundError("User not found after update");

    return this.toResponse(reloaded);
  }

  /** Self-service: update own profile */
  async updateMe(currentUser: User, dto: UpdateMeDto): Promise<UserResponseDto> {
    await this.ensureValidation(dto);
    const user = await this.userRepository.findById(currentUser.id);
    if (!user) throw new NotFoundError("User not found");

    if (dto.email !== undefined) user.email = dto.email;
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber;

    await this.userRepository.save(user);

    const reloaded = await this.userRepository.findByIdInCompany(user.id, user.companyId);
    if (!reloaded) throw new NotFoundError("User not found after update");

    return this.toResponse(reloaded);
  }

  /** Self-service: change password */
  async changePassword(currentUser: User, dto: ChangePasswordDto): Promise<void> {
    await this.ensureValidation(dto);

    const user = await this.userRepository.findById(currentUser.id);
    if (!user) throw new NotFoundError("User not found");

    const ok = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!ok) throw new ForbiddenError("Current password is incorrect");

    user.passwordHash = await argon2.hash(dto.newPassword);
    user.mustChangePasswordAtNextLogin = false;

    await this.userRepository.save(user);
  }

  /** Admin: hard-delete user */
  async hardDeleteUser(companyId: string, userId: string, currentUser: User): Promise<void> {
    await this.ensurePermission(currentUser, "delete_user");
    const target = await this.userRepository.findByIdInCompany(userId, companyId, true);
    if (!target) throw new NotFoundError("User not found");
    await this.userRepository.hardDelete(userId);
  }

  /** Admin: soft-delete & restore */
  async softDeleteUser(companyId: string, userId: string, currentUser: User): Promise<void> {
    await this.ensurePermission(currentUser, "delete_user");
    const target = await this.userRepository.findByIdInCompany(userId, companyId);
    if (!target) throw new NotFoundError("User not found");
    await this.userRepository.softDelete(userId);
  }

  async restoreUser(companyId: string, userId: string, currentUser: User): Promise<void> {
    await this.ensurePermission(currentUser, "restore_user");
    const target = await this.userRepository.findByIdInCompany(userId, companyId, true);
    if (!target) throw new NotFoundError("User not found");
    await this.userRepository.restore(userId);
  }

  /** Admin: revoke a specific session by id (not raw token) */
  async revokeSessionById(companyId: string, currentUser: User, dto: RevokeSessionDto): Promise<void> {
    await this.ensurePermission(currentUser, "revoke_session");

    const session = await this.activeSessionRepository.findById(dto.sessionId);
    if (!session || session.companyId !== companyId) {
      throw new NotFoundError("Session not found");
    }
    await this.activeSessionRepository.update(session.id, { revokedAt: new Date() });
  }

  /** List active sessions for a user (admin or self) */
  async listUserSessions(
    companyId: string,
    currentUser: User,
    userId?: string
  ): Promise<ActiveSessionResponseDto[]> {
    const targetUserId = userId ?? currentUser.id;
    if (targetUserId !== currentUser.id) {
      await this.ensurePermission(currentUser, "view_user_sessions");
    }
    const sessions = await this.activeSessionRepository.findAllForUser(companyId, targetUserId);
    return sessions.map(s => ({
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
