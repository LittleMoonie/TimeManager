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
import { CreateUserActivityLogDto } from "../../Dtos/Logs/User/UserActivityLogDto";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";

@Service()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: UserRepository,
    @InjectRepository(UserStatus)
    private userStatusRepository: Repository<UserStatus>,
    private userActivityLogService: UserActivityLogService,
    private roleService: RoleService,
    private rolePermissionService: RolePermissionService,
  ) {}

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

    // Hash password if provided
    if (updateUserDto.password) {
      user.passwordHash = await argon2.hash(updateUserDto.password);
    }

    // Update role if provided
    if (updateUserDto.roleId && updateUserDto.roleId !== user.roleId) {
      const role = await this.roleService.getRoleById(
        companyId,
        updateUserDto.roleId,
      );
      user.role = role;
    }

    // Update status if provided
    if (updateUserDto.statusId && updateUserDto.statusId !== user.statusId) {
      const status = await this.userStatusRepository.findOne({
        where: { id: updateUserDto.statusId },
      });
      if (!status) {
        throw new NotFoundError("UserStatus not found");
      }
      user.status = status;
    }

    // Apply other updates
    user.email = updateUserDto.email ?? user.email;
    user.firstName = updateUserDto.firstName ?? user.firstName;
    user.lastName = updateUserDto.lastName ?? user.lastName;
    user.phoneNumber = updateUserDto.phoneNumber ?? user.phoneNumber;

    const updatedUser = await this.userRepository.save(user);

    await this.userActivityLogService.log(companyId, {
      userId: currentUser.id,
      activityType: UserActivityType.UPDATE_USER,
      targetId: userId,
      details: {
        old: oldUserDetails as unknown as Record<string, string>,
        new: updateUserDto as unknown as Record<string, string>,
      },
    } as unknown as CreateUserActivityLogDto);

    return updatedUser;
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

    const deleteResult = await this.userRepository.softDelete(userId);

    if (deleteResult.affected === 0) {
      throw new NotFoundError("User not found");
    }

    await this.userActivityLogService.log(companyId, {
      userId: currentUser.id,
      activityType: UserActivityType.DELETE_USER,
      targetId: userId,
      details: { softDeletedUserId: userId },
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
