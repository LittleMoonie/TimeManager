import { Service } from "typedi";
import { validate } from "class-validator";

import { Permission } from "@/Entities/Roles/Permission";
import { ForbiddenError, NotFoundError, UnprocessableEntityError } from "@/Errors/HttpErrors";
import { PermissionRepository } from "@/Repositories/Roles/PermissionRepository";
import { RolePermissionService } from "@/Services/RoleService/RolePermissionService";
import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from "@/Dtos/Roles/RoleDto";
import User from "@/Entities/Users/User";

@Service()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly rolePermissionService: RolePermissionService
  ) {}

  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map(e => e.toString()).join(", ")}`
      );
    }
  }

  async createPermission(
    companyId: string,
    currentUser: User,
    dto: CreatePermissionDto,
  ): Promise<Permission> {
    if (!(await this.rolePermissionService.checkPermission(currentUser, "create_permission"))) {
      throw new ForbiddenError("User does not have permission to create permissions.");
    }

    await this.ensureValidation(dto);

    return this.permissionRepository.create({
      companyId,
      ...dto,
    });
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
    const permission = await this.permissionRepository.findByName(companyId, name);
    if (!permission) {
      throw new NotFoundError("Permission not found");
    }
    return permission;
  }

  async getAllPermissions(companyId: string): Promise<Permission[]> {
    return this.permissionRepository.findAllInCompany(companyId);
  }

  async updatePermission(
    companyId: string,
    currentUser: User,
    permissionId: string,
    dto: UpdatePermissionDto,
  ): Promise<Permission> {
    if (!(await this.rolePermissionService.checkPermission(currentUser, "update_permission"))) {
      throw new ForbiddenError("User does not have permission to update permissions.");
    }

    await this.ensureValidation(dto);
    await this.getPermissionById(companyId, permissionId);

    const updated = await this.permissionRepository.update(permissionId, dto);
    if (updated) return updated;

    const reloaded = await this.permissionRepository.findById(permissionId);
    if (!reloaded || reloaded.companyId !== companyId) {
      throw new NotFoundError("Permission not found after update");
    }
    return reloaded;
  }

  async deletePermission(
    companyId: string,
    currentUser: User,
    permissionId: string,
  ): Promise<void> {
    if (!(await this.rolePermissionService.checkPermission(currentUser, "delete_permission"))) {
      throw new ForbiddenError("User does not have permission to delete permissions.");
    }

    const permission = await this.getPermissionById(companyId, permissionId);
    await this.permissionRepository.delete(permission.id);
  }
}
