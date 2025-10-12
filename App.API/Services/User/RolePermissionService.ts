import { Service } from "typedi";
import { RolePermissionRepository } from "../../Repositories/Users/RolePermissionRepository";
import { RolePermission } from "../../Entities/Users/RolePermission";
import { ForbiddenError } from "../../Errors/HttpErrors";
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

  public async deleteRolePermission(
    currentUser: User,
    id: string,
  ): Promise<void> {
    if (!(await this.checkPermission(currentUser, "delete_role_permission"))) {
      throw new ForbiddenError(
        "User does not have permission to delete role permissions.",
      );
    }
    await this.rolePermissionRepository.findById(id);
    await this.rolePermissionRepository.delete(id);
  }
}
