import { Service } from "typedi";
import { RolePermissionRepository } from "@/Repositories/Roles/RolePermissionRepository";
import { RolePermission } from "@/Entities/Roles/RolePermission";
import { ForbiddenError, NotFoundError } from "@/Errors/HttpErrors";
import { CreateRolePermissionDto } from "@/Dtos/Roles/RoleDto";
import User from "@/Entities/Users/User";

@Service()
export class RolePermissionService {
  constructor(
    private readonly rolePermissionRepository: RolePermissionRepository
  ) {}

  public async checkPermission(user: User, permissionName: string): Promise<boolean> {
    if (!user?.role?.rolePermissions?.length) return false;
    return user.role.rolePermissions.some(rp => rp.permission?.name === permissionName);
  }

  public async createRolePermission(
    currentUser: User,
    companyId: string,
    createRolePermissionDto: CreateRolePermissionDto,
  ): Promise<RolePermission> {
    if (!(await this.checkPermission(currentUser, "create_role_permission"))) {
      throw new ForbiddenError("User does not have permission to create role permissions.");
    }

    const existing = await this.rolePermissionRepository.findByRoleAndPermission(
      companyId,
      createRolePermissionDto.roleId,
      createRolePermissionDto.permissionId
    );
    if (existing) return existing;

    return this.rolePermissionRepository.create({
      companyId,
      ...createRolePermissionDto,
    });
  }

  public async deleteRolePermission(
    currentUser: User,
    companyId: string,
    id: string,
  ): Promise<void> {
    if (!(await this.checkPermission(currentUser, "delete_role_permission"))) {
      throw new ForbiddenError("User does not have permission to delete role permissions.");
    }

    const link = await this.rolePermissionRepository.findById(id);
    if (!link || link.companyId !== companyId) {
      throw new NotFoundError("RolePermission not found");
    }
    await this.rolePermissionRepository.removeById(companyId, id);
  }
}
