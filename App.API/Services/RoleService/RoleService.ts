import { Service } from "typedi";
import { validate } from "class-validator";

import { RoleRepository } from "@/Repositories/Roles/RoleRepository";
import { RolePermissionRepository } from "@/Repositories/Roles/RolePermissionRepository";

import { Role } from "@/Entities/Roles/Role";
import { RolePermission } from "@/Entities/Roles/RolePermission";
import User from "@/Entities/Users/User";

import {
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
} from "@/Errors/HttpErrors";

import { CreateRoleDto, UpdateRoleDto } from "@/Dtos/Roles/RoleDto";

@Service()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly rolePermissionRepository: RolePermissionRepository
  ) {}

  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map(e => e.toString()).join(", ")}`
      );
    }
  }

  private async ensurePermission(currentUser: User, permission: string) {
    const role = currentUser.role;
    const allowed =
      !!role &&
      Array.isArray(role.rolePermissions) &&
      role.rolePermissions.some(rp => rp.permission?.name === permission);

    if (!allowed) {
      throw new ForbiddenError(`Missing permission: ${permission}`);
    }
  }

  private ensureSameCompanyOrAdmin(currentUser: User, targetCompanyId: string) {
    if (currentUser.role?.name !== "admin" && currentUser.companyId !== targetCompanyId) {
      throw new ForbiddenError("Operation is restricted to your company.");
    }
  }

  async getRoleById(companyId: string, roleId: string, currentUser: User): Promise<Role> {
    const role = await this.roleRepository.findByIdInCompany(roleId, companyId);
    if (!role) throw new NotFoundError("Role not found");
    this.ensureSameCompanyOrAdmin(currentUser, role.companyId);
    return role;
  }

  async listRoles(companyId: string, currentUser: User): Promise<Role[]> {
    this.ensureSameCompanyOrAdmin(currentUser, companyId);
    return this.roleRepository.findAllByCompanyId(companyId);
  }

  async createRole(
    companyId: string,
    currentUser: User,
    dto: CreateRoleDto
  ): Promise<Role> {
    await this.ensurePermission(currentUser, "create_role");
    await this.ensureValidation(dto);

    const existing = await this.roleRepository.findByNameInCompany(dto.name, companyId);
    if (existing) {
      throw new UnprocessableEntityError("A role with this name already exists in the company.");
    }

    return this.roleRepository.create({
      companyId,
      name: dto.name,
      description: dto.description,
    } as Role);
  }

  async updateRole(
    companyId: string,
    roleId: string,
    currentUser: User,
    dto: UpdateRoleDto
  ): Promise<Role> {
    await this.ensurePermission(currentUser, "update_role");
    await this.ensureValidation(dto);

    const role = await this.getRoleById(companyId, roleId, currentUser);

    if (dto.name && dto.name !== role.name) {
      const nameTaken = await this.roleRepository.findByNameInCompany(dto.name, companyId);
      if (nameTaken) {
        throw new UnprocessableEntityError("A role with this name already exists in the company.");
      }
    }

    role.name = dto.name ?? role.name;
    role.description = dto.description ?? role.description;

    return this.roleRepository.save(role);
  }

  async deleteRole(companyId: string, roleId: string, currentUser: User): Promise<void> {
    await this.ensurePermission(currentUser, "delete_role");

    const role = await this.getRoleById(companyId, roleId, currentUser);
    this.ensureSameCompanyOrAdmin(currentUser, role.companyId);

    await this.roleRepository.softDelete(role.id);
  }

  async assignPermissionToRole(
    companyId: string,
    roleId: string,
    permissionId: string,
    currentUser: User
  ): Promise<RolePermission> {
    await this.ensurePermission(currentUser, "assign_role_permission");

    const role = await this.getRoleById(companyId, roleId, currentUser);

    const existing = await this.rolePermissionRepository.findByRoleAndPermission(
      companyId,
      role.id,
      permissionId
    );
    if (existing) return existing;

    return this.rolePermissionRepository.create({
      companyId,
      roleId: role.id,
      permissionId,
    } as RolePermission);
  }

  async removePermissionFromRole(
    companyId: string,
    roleId: string,
    permissionId: string,
    currentUser: User
  ): Promise<void> {
    await this.ensurePermission(currentUser, "remove_role_permission");

    const role = await this.getRoleById(companyId, roleId, currentUser);

    const link = await this.rolePermissionRepository.findByRoleAndPermission(
      companyId,
      role.id,
      permissionId
    );
    if (!link) return;
    await this.rolePermissionRepository.removeById(companyId, link.id);
  }

  async listRolePermissions(
    companyId: string,
    roleId: string,
    currentUser: User
  ): Promise<RolePermission[]> {
    const role = await this.getRoleById(companyId, roleId, currentUser);
    return this.rolePermissionRepository.findAllByRole(companyId, role.id);
  }
}
