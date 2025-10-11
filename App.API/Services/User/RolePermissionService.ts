import { Service } from "typedi";
import { RolePermissionRepository } from "../../Repositories/Users/RolePermissionRepository";
import { RolePermission } from "../../Entities/Users/RolePermission";
import { NotFoundError, ForbiddenError } from "../../Errors/HttpErrors";
import { CreateRolePermissionDto } from "../../Dtos/Users/RolePermissionDto";
import User from "../../Entities/Users/User";

@Service()
export class RolePermissionService {
  constructor(private rolePermissionRepository: RolePermissionRepository) {}

  public async checkPermission(
    user: User,
    permissionName: string,
  ): Promise<boolean> {
    if (!user.role || !user.role.rolePermissions) {
      return false;
    }
    const permissions = user.role.rolePermissions.map(
      (rp) => rp.permission.name,
    );
    return permissions.includes(permissionName);
  }

  public async createRolePermission(
    currentUser: User,
    companyId: string,
    createRolePermissionDto: CreateRolePermissionDto,
  ): Promise<RolePermission> {
    if (!(await this.checkPermission(currentUser, "create_role_permission"))) {
      throw new ForbiddenError(
        "User does not have permission to create role permissions.",
      );
    }
    return this.rolePermissionRepository.create({
      companyId,
      ...createRolePermissionDto,
    });
  }

  public async getRolePermissionById(
    companyId: string,
    id: string,
  ): Promise<RolePermission> {
    const rolePermission =
      await this.rolePermissionRepository.findByIdWithRelations(companyId, id);
    if (!rolePermission) {
      throw new NotFoundError("RolePermission not found");
    }
    return rolePermission;
  }

  public async deleteRolePermission(
    currentUser: User,
    companyId: string,
    id: string,
  ): Promise<void> {
    if (!(await this.checkPermission(currentUser, "delete_role_permission"))) {
      throw new ForbiddenError(
        "User does not have permission to delete role permissions.",
      );
    }
    await this.getRolePermissionById(companyId, id);
    await this.rolePermissionRepository.delete(id);
  }
}
