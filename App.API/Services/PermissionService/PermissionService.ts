import { UserActivityType } from "../../Entities/Logs/Users/UserActivityLog";
import { Permission } from "../../Entities/Users/Permission";
import { NotFoundError } from "../../Errors/HttpErrors";
import { PermissionRepository } from "../../Repositories/Users/PermissionRepository";
import { UserActivityLogService } from "../Logs/User/UserActivityLogService";
import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from "../../Dtos/Users/PermissionDto";
import { CreateUserActivityLogDto } from "../../Dtos/Logs/User/UserActivityLogDto";

export class PermissionService {
  private permissionRepository = new PermissionRepository();
  private userActivityLogService = new UserActivityLogService();

  async createPermission(
    companyId: string,
    userId: string,
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.permissionRepository.create({
      companyId,
      ...createPermissionDto,
    });

    await this.userActivityLogService.log(companyId, {
      userId,
      activityType: UserActivityType.CREATE_PERMISSION,
      targetId: permission.id,
      details: createPermissionDto as unknown as Record<string, string>,
    });

    return permission;
  }

  async getPermissionById(
    companyId: string,
    permissionId: string,
  ): Promise<Permission> {
    const permission = await this.permissionRepository.findById(permissionId);
    if (!permission || permission.companyId !== companyId) {
      throw new NotFoundError("Permission not found");
    }
    return permission;
  }

  async getPermissionByName(
    companyId: string,
    name: string,
  ): Promise<Permission> {
    const permission = await this.permissionRepository.findByName(
      companyId,
      name,
    );
    if (!permission) {
      throw new NotFoundError("Permission not found");
    }
    return permission;
  }

  async getAllPermissions(companyId: string): Promise<Permission[]> {
    return this.permissionRepository.findAll(companyId);
  }

  async updatePermission(
    companyId: string,
    userId: string,
    permissionId: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.getPermissionById(companyId, permissionId);

    const oldPermissionDetails = { ...permission } as unknown as Record<
      string,
      string
    >;

    const updatedPermission = await this.permissionRepository.update(
      permissionId,
      updatePermissionDto,
    );

    await this.userActivityLogService.log(companyId, {
      userId,
      activityType: UserActivityType.UPDATE_PERMISSION,
      targetId: permissionId,
      details: {
        old: oldPermissionDetails as unknown as Record<string, string>,
        new: updatePermissionDto as unknown as Record<string, string>,
      },
    } as unknown as CreateUserActivityLogDto);

    return updatedPermission!;
  }

  async deletePermission(
    companyId: string,
    userId: string,
    permissionId: string,
  ): Promise<void> {
    const permission = await this.getPermissionById(companyId, permissionId);

    await this.permissionRepository.delete(permissionId);

    await this.userActivityLogService.log(companyId, {
      userId,
      activityType: UserActivityType.DELETE_PERMISSION,
      targetId: permissionId,
      details: { name: permission.name },
    });
  }
}
