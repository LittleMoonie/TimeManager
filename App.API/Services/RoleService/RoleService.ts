import { AppDataSource } from "../../Server/Database";
import { Role } from "../../Entities/Users/Role";
import { Permission } from "../../Entities/Users/Permission";
import { RolePermission } from "../../Entities/Users/RolePermission";
import { UserActivityType } from "../../Entities/Logs/Users/UserActivityLog";
import { PermissionService } from "../PermissionService/PermissionService";
import { NotFoundError } from "../../Errors/HttpErrors";
import { RoleRepository } from "../../Repositories/Users/RoleRepository";
import { UserActivityLogService } from "../Logs/User/UserActivityLogService";
import { CreateRoleDto, UpdateRoleDto } from "../../Dtos/Users/RoleDto";
import { CreateUserActivityLogDto } from "../../Dtos/Logs/User/UserActivityLogDto";

export class RoleService {
  private roleRepository = new RoleRepository();
  private rolePermissionRepository =
    AppDataSource.getRepository(RolePermission);
  private userActivityLogService = new UserActivityLogService();
  private permissionService = new PermissionService();

  async createRole(
    companyId: string,
    userId: string,
    createRoleDto: CreateRoleDto,
  ): Promise<Role> {
    const role = await this.roleRepository.create({
      companyId,
      ...createRoleDto,
    });

    await this.userActivityLogService.log(companyId, {
      userId,
      activityType: UserActivityType.CREATE_ROLE,
      targetId: role.id,
      details: createRoleDto as unknown as Record<string, string>,
    });

    return role;
  }

  async getRoleById(roleId: string): Promise<Role> {
    const role = await this.roleRepository.findById(roleId);  
    if (!role) {
      throw new NotFoundError("Role not found");
    }
    return role;
  }

  async getRoleByName(companyId: string, name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { companyId, name },
      relations: ["rolePermissions", "rolePermissions.permission"],
    });
    if (!role) {
      throw new NotFoundError("Role not found");
    }
    return role;
  }

  async getAllRoles(companyId: string): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async updateRole(
    companyId: string,
    roleId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    const role = await this.getRoleById(roleId);
    const updatedRole = await this.roleRepository.update(roleId, updateRoleDto);
    if (!updatedRole) {
      throw new NotFoundError("Role not found");
    }
    return updatedRole;
  }

  async updateRolePermissions(
    companyId: string,
    userId: string,
    roleId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    const role = await this.getRoleById(roleId);

    const oldRoleDetails = { ...role } as unknown as Record<string, string>;

    const updatedRole = await this.roleRepository.update(roleId, updateRoleDto);

    await this.userActivityLogService.log(companyId, {
      userId,
      activityType: UserActivityType.UPDATE_ROLE,
      targetId: roleId,
      details: {
        old: oldRoleDetails,
        new: updateRoleDto as unknown as Record<string, string>,
      },
    } as unknown as CreateUserActivityLogDto);

    return updatedRole!;
  }

  async deleteRole(
    companyId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    const role = await this.getRoleById(roleId);

    await this.roleRepository.delete(roleId);

    await this.userActivityLogService.log(companyId, {
      userId,
      activityType: UserActivityType.DELETE_ROLE,
      targetId: roleId,
      details: { name: role.name },
    });
  }

  async addPermissionToRole(
    companyId: string,
    userId: string,
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission> {
    await this.getRoleById(roleId);
    await this.permissionService.getPermissionById(companyId, permissionId);

    const rolePermission = this.rolePermissionRepository.create({
      companyId,
      roleId,
      permissionId,
    });
    const savedRolePermission =
      await this.rolePermissionRepository.save(rolePermission);

    await this.userActivityLogService.log(companyId, {
      userId,
      activityType: UserActivityType.ADD_PERMISSION_TO_ROLE,
      targetId: roleId,
      details: { permissionId },
    } as unknown as CreateUserActivityLogDto);

    return savedRolePermission;
  }

  async removePermissionFromRole(
    companyId: string,
    userId: string,
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    const rolePermission = await this.rolePermissionRepository.findAndCountBy({ companyId, roleId, permissionId });
    if (rolePermission[0].length === 0) {
      throw new NotFoundError("RolePermission not found");
    }
    await this.rolePermissionRepository.delete(rolePermission[0][0].id);

    await this.userActivityLogService.log(companyId, {
      userId,
      activityType: UserActivityType.REMOVE_PERMISSION_FROM_ROLE,
      targetId: roleId,
      details: { permissionId },
    } as unknown as CreateUserActivityLogDto);
  }

  async getRolePermissions(
    companyId: string,
    roleId: string,
  ): Promise<Permission[]> {
    const role = await this.getRoleById(roleId);
    return role.rolePermissions.map((rp) => rp.permission);
  }
}
