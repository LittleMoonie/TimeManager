import {
  UnprocessableEntityError,
  NotFoundError,
  ForbiddenError,
} from "../../Errors/HttpErrors";
import { UserRepository } from "../../Repositories/Users/UserRepository";
import { UserActivityType } from "../../Entities/Logs/Users/UserActivityLog";
import { UserActivityLogService } from "../Logs/User/UserActivityLogService";
import { AppDataSource } from "../../Server/Database";
import { UserStatus } from "../../Entities/Users/UserStatus";
import { RoleService } from "../RoleService/RoleService";
import User from "../../Entities/Users/User";
import { CreateUserDto } from "../../Dtos/Users/CreateUserDto";
import { validate } from "class-validator";
import * as argon2 from "argon2";
import { UpdateUserDto } from "../../Dtos/Users/UpdateUserDto";
import { RolePermissionService } from "./RolePermissionService";
import { RolePermissionRepository } from "../../Repositories/Users/RolePermissionRepository";
import { CreateUserActivityLogDto } from "../../Dtos/Logs/User/UserActivityLogDto";

export class UserService {
  private userRepository = new UserRepository();
  private userStatusRepository = AppDataSource.getRepository(UserStatus);
  private userActivityLogService = new UserActivityLogService();
  private roleService = new RoleService();
  private rolePermissionService = new RolePermissionService(
    new RolePermissionRepository(),
  );

  async createUser(
    companyId: string,
    currentUser: User | null,
    createUserDto: CreateUserDto,
  ): Promise<User> {
    const errors = await validate(createUserDto);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(", ")}`,
      );
    }

    if (
      currentUser &&
      !(await this.rolePermissionService.checkPermission(
        currentUser,
        "create_user",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to create users.",
      );
    }

    const role = await this.roleService.getRoleById(
      companyId,
      createUserDto.roleId,
    );

    if (
      currentUser &&
      role.name === "manager" &&
      !(await this.rolePermissionService.checkPermission(
        currentUser,
        "create_manager",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to create managers.",
      );
    }

    if (
      currentUser &&
      role.name === "admin" &&
      !(await this.rolePermissionService.checkPermission(
        currentUser,
        "create_admin",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to create admins.",
      );
    }

    const passwordHash = await argon2.hash(createUserDto.password);

    const user = await this.userRepository.create({
      ...createUserDto,
      companyId,
      passwordHash,
      role,
    });

    await this.userActivityLogService.log(companyId, {
      userId: user.id,
      activityType: UserActivityType.CREATE_USER,
      targetId: user.id,
      details: createUserDto as unknown as Record<string, string>,
    } as unknown as CreateUserActivityLogDto);

    return user;
  }

  async getUserById(companyId: string, userId: string): Promise<User> {
    const user = await this.userRepository.findByIdWithRelations(
      companyId,
      userId,
    );
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async getUserByEmail(companyId: string, email: string): Promise<User> {
    const user = await this.userRepository.findByEmailWithRelations(
      companyId,
      email,
    );
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async getUser(
    companyId: string,
    actingUser: User,
    userId: string,
  ): Promise<User> {
    if (actingUser.role.name === "employee" && actingUser.id !== userId) {
      throw new ForbiddenError(
        "Forbidden: Employees can only view their own profile",
      );
    }

    return this.getUserById(companyId, userId);
  }

  async getAllUsers(companyId: string): Promise<User[]> {
    return this.userRepository.findAll(companyId);
  }

  async updateUser(
    companyId: string,
    userId: string,
    currentUser: User,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    if (
      !(await this.rolePermissionService.checkPermission(
        currentUser,
        "update_user",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to update users.",
      );
    }
    const errors = await validate(updateUserDto);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(", ")}`,
      );
    }

    const user = await this.getUserById(companyId, userId);

    const oldUserDetails = { ...user };

    if (updateUserDto.password) {
      updateUserDto.password = await argon2.hash(updateUserDto.password);
    }

    let role;
    if (updateUserDto.roleId) {
      role = await this.roleService.getRoleById(
        companyId,
        updateUserDto.roleId,
      );
      if (!role) {
        throw new NotFoundError("Role not found");
      }
    }

    let status;
    if (updateUserDto.statusId) {
      status = await this.userStatusRepository.findOne({
        where: { id: updateUserDto.statusId },
      });
      if (!status) {
        throw new NotFoundError("UserStatus not found");
      }
    }

    const updatedUser = await this.userRepository.update(userId, {
      ...updateUserDto,
      role,
      status,
    });

    await this.userActivityLogService.log(companyId, {
      userId: currentUser.id,
      activityType: UserActivityType.UPDATE_USER,
      targetId: userId,
      details: {
        old: oldUserDetails as unknown as Record<string, string>,
        new: updateUserDto as unknown as Record<string, string>,
      },
    } as unknown as CreateUserActivityLogDto);

    return updatedUser!;
  }

  async deleteUser(
    companyId: string,
    userId: string,
    currentUser: User,
  ): Promise<void> {
    if (
      !(await this.rolePermissionService.checkPermission(
        currentUser,
        "delete_user",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to delete users.",
      );
    }
    const user = await this.getUserById(companyId, userId);

    await this.userRepository.delete(userId);

    await this.userActivityLogService.log(companyId, {
      userId: currentUser.id,
      activityType: UserActivityType.DELETE_USER,
      targetId: userId,
      details: { email: user.email } as unknown as Record<string, string>,
    });
  }

  async changeUserStatus(
    companyId: string,
    userId: string,
    currentUser: User,
    statusId: string,
  ): Promise<User> {
    if (
      !(await this.rolePermissionService.checkPermission(
        currentUser,
        "change_user_status",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to change user status.",
      );
    }
    const user = await this.getUserById(companyId, userId);

    const status = await this.userStatusRepository.findOne({
      where: { id: statusId },
    });
    if (!status) {
      throw new NotFoundError("UserStatus not found");
    }

    const oldStatusId = user.statusId;

    const updatedUser = await this.userRepository.update(userId, { statusId });

    await this.userActivityLogService.log(companyId, {
      userId: currentUser.id,
      activityType: UserActivityType.CHANGE_USER_STATUS,
      targetId: userId,
      details: { old: oldStatusId, new: statusId },
    } as unknown as CreateUserActivityLogDto);

    return updatedUser!;
  }
}
