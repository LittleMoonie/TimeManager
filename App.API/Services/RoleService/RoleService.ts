import { Service } from 'typedi';
import { validate } from 'class-validator';

import { RoleRepository } from '../../Repositories/Roles/RoleRepository';
import { RolePermissionRepository } from '../../Repositories/Roles/RolePermissionRepository';

import { Role } from '../../Entities/Roles/Role';
import { RolePermission } from '../../Entities/Roles/RolePermission';
import User from '../../Entities/Users/User';

import { ForbiddenError, NotFoundError, UnprocessableEntityError } from '../../Errors/HttpErrors';

import { CreateRoleDto, UpdateRoleDto } from '../../Dtos/Roles/RoleDto';

/**
 * @description Service layer for managing Role entities and their associated permissions. This service provides business logic
 * for role-related operations, including CRUD for roles, and assigning/removing permissions, with integrated permission checks.
 */
@Service()
export class RoleService {
  /**
   * @description Initializes the RoleService with necessary repositories.
   * @param roleRepository The repository for Role entities.
   * @param rolePermissionRepository The repository for RolePermission entities.
   */
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  /**
   * @description Ensures that a given DTO (Data Transfer Object) is valid by performing class-validator validation.
   * @param dto The DTO object to validate.
   * @returns A Promise that resolves if validation passes.
   * @throws {UnprocessableEntityError} If validation fails, containing details of the validation errors.
   */
  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(', ')}`,
      );
    }
  }

  /**
   * @description Checks if the current user has a specific permission.
   * @param currentUser The user whose permissions are to be checked.
   * @param permission The name of the permission to check for.
   * @returns A Promise that resolves if the user has the permission.
   * @throws {ForbiddenError} If the current user does not have the required permission.
   */
  private async ensurePermission(currentUser: User, permission: string) {
    const role = currentUser.role;
    const allowed =
      !!role &&
      Array.isArray(role.rolePermissions) &&
      role.rolePermissions.some((rp) => rp.permission?.name === permission);

    if (!allowed) {
      throw new ForbiddenError(`Missing permission: ${permission}`);
    }
  }

  /**
   * @description Ensures that the current user is either an admin or belongs to the same company as the target.
   * @param currentUser The user performing the action.
   * @param targetCompanyId The unique identifier of the target company.
   * @throws {ForbiddenError} If the user is not an admin and does not belong to the target company.
   */
  private ensureSameCompanyOrAdmin(currentUser: User, targetCompanyId: string) {
    if (currentUser.role?.name !== 'admin' && currentUser.companyId !== targetCompanyId) {
      throw new ForbiddenError('Operation is restricted to your company.');
    }
  }

  /**
   * @description Retrieves a role by its ID within a specific company, with permission checks.
   * @param companyId The unique identifier of the company.
   * @param roleId The unique identifier of the role.
   * @param currentUser The user performing the action.
   * @returns A Promise that resolves to the Role entity.
   * @throws {NotFoundError} If the role is not found.
   * @throws {ForbiddenError} If the current user does not have access to the role's company.
   */
  async getRoleById(companyId: string, roleId: string, currentUser: User): Promise<Role> {
    const role = await this.roleRepository.findByIdInCompany(roleId, companyId);
    if (!role) throw new NotFoundError('Role not found');
    this.ensureSameCompanyOrAdmin(currentUser, role.companyId);
    return role;
  }

  /**
   * @description Lists all roles for a given company, with permission checks.
   * @param companyId The unique identifier of the company.
   * @param currentUser The user performing the action.
   * @returns A Promise that resolves to an array of Role entities.
   * @throws {ForbiddenError} If the current user does not have access to the specified company.
   */
  async listRoles(companyId: string, currentUser: User): Promise<Role[]> {
    this.ensureSameCompanyOrAdmin(currentUser, companyId);
    return this.roleRepository.findAllByCompanyId(companyId);
  }

  /**
   * @description Creates a new role within a specified company, with permission checks.
   * Requires 'create_role' permission.
   * @param companyId The unique identifier of the company where the role will be created.
   * @param currentUser The user performing the action.
   * @param dto The CreateRoleDto containing the new role's name and optional description.
   * @returns A Promise that resolves to the newly created Role entity.
   * @throws {ForbiddenError} If the current user does not have 'create_role' permission.
   * @throws {UnprocessableEntityError} If validation fails or a role with the same name already exists in the company.
   */
  async createRole(companyId: string, currentUser: User, dto: CreateRoleDto): Promise<Role> {
    await this.ensurePermission(currentUser, 'create_role');
    await this.ensureValidation(dto);

    const existing = await this.roleRepository.findByNameInCompany(dto.name, companyId);
    if (existing) {
      throw new UnprocessableEntityError('A role with this name already exists in the company.');
    }

    return this.roleRepository.create({
      companyId,
      name: dto.name,
      description: dto.description,
    } as Role);
  }

  /**
   * @description Updates an existing role within a specified company, with permission checks.
   * Requires 'update_role' permission.
   * @param companyId The unique identifier of the company the role belongs to.
   * @param roleId The unique identifier of the role to update.
   * @param currentUser The user performing the action.
   * @param dto The UpdateRoleDto containing the updated role data.
   * @returns A Promise that resolves to the updated Role entity.
   * @throws {ForbiddenError} If the current user does not have 'update_role' permission or access to the role's company.
   * @throws {UnprocessableEntityError} If validation fails or an attempt is made to change the name to one that already exists.
   * @throws {NotFoundError} If the role to update is not found.
   */
  async updateRole(
    companyId: string,
    roleId: string,
    currentUser: User,
    dto: UpdateRoleDto,
  ): Promise<Role> {
    await this.ensurePermission(currentUser, 'update_role');
    await this.ensureValidation(dto);

    const role = await this.getRoleById(companyId, roleId, currentUser);

    if (dto.name && dto.name !== role.name) {
      const nameTaken = await this.roleRepository.findByNameInCompany(dto.name, companyId);
      if (nameTaken) {
        throw new UnprocessableEntityError('A role with this name already exists in the company.');
      }
    }

    role.name = dto.name ?? role.name;
    role.description = dto.description ?? role.description;

    return this.roleRepository.save(role);
  }

  /**
   * @description Soft deletes a role within a specified company, with permission checks.
   * Requires 'delete_role' permission.
   * @param companyId The unique identifier of the company the role belongs to.
   * @param roleId The unique identifier of the role to soft delete.
   * @param currentUser The user performing the action.
   * @returns A Promise that resolves when the soft deletion is complete.
   * @throws {ForbiddenError} If the current user does not have 'delete_role' permission or access to the role's company.
   * @throws {NotFoundError} If the role to delete is not found.
   */
  async deleteRole(companyId: string, roleId: string, currentUser: User): Promise<void> {
    await this.ensurePermission(currentUser, 'delete_role');

    const role = await this.getRoleById(companyId, roleId, currentUser);
    this.ensureSameCompanyOrAdmin(currentUser, role.companyId);

    await this.roleRepository.softDelete(role.id);
  }

  /**
   * @description Assigns a permission to a role within a specified company, with permission checks.
   * Requires 'assign_role_permission' permission.
   * @param companyId The unique identifier of the company.
   * @param roleId The unique identifier of the role to assign the permission to.
   * @param permissionId The unique identifier of the permission to assign.
   * @param currentUser The user performing the action.
   * @returns A Promise that resolves to the created RolePermission entity. If the permission is already assigned, it returns the existing association.
   * @throws {ForbiddenError} If the current user does not have 'assign_role_permission' permission or access to the role's company.
   * @throws {NotFoundError} If the role is not found.
   */
  async assignPermissionToRole(
    companyId: string,
    roleId: string,
    permissionId: string,
    currentUser: User,
  ): Promise<RolePermission> {
    await this.ensurePermission(currentUser, 'assign_role_permission');

    const role = await this.getRoleById(companyId, roleId, currentUser);

    const existing = await this.rolePermissionRepository.findByRoleAndPermission(
      companyId,
      role.id,
      permissionId,
    );
    if (existing) return existing;

    return this.rolePermissionRepository.create({
      companyId,
      roleId: role.id,
      permissionId,
    } as RolePermission);
  }

  /**
   * @description Removes a permission from a role within a specified company, with permission checks.
   * Requires 'remove_role_permission' permission.
   * @param companyId The unique identifier of the company.
   * @param roleId The unique identifier of the role to remove the permission from.
   * @param permissionId The unique identifier of the permission to remove.
   * @param currentUser The user performing the action.
   * @returns A Promise that resolves when the removal is complete.
   * @throws {ForbiddenError} If the current user does not have 'remove_role_permission' permission or access to the role's company.
   * @throws {NotFoundError} If the role is not found.
   */
  async removePermissionFromRole(
    companyId: string,
    roleId: string,
    permissionId: string,
    currentUser: User,
  ): Promise<void> {
    await this.ensurePermission(currentUser, 'remove_role_permission');

    const role = await this.getRoleById(companyId, roleId, currentUser);

    const link = await this.rolePermissionRepository.findByRoleAndPermission(
      companyId,
      role.id,
      permissionId,
    );
    if (!link) return;
    await this.rolePermissionRepository.removeById(companyId, link.id);
  }

  /**
   * @description Lists all permissions assigned to a specific role within a given company, with permission checks.
   * @param companyId The unique identifier of the company.
   * @param roleId The unique identifier of the role.
   * @param currentUser The user performing the action.
   * @returns A Promise that resolves to an array of RolePermission entities.
   * @throws {NotFoundError} If the role is not found.
   * @throws {ForbiddenError} If the current user does not have access to the role's company.
   */
  async listRolePermissions(
    companyId: string,
    roleId: string,
    currentUser: User,
  ): Promise<RolePermission[]> {
    const role = await this.getRoleById(companyId, roleId, currentUser);
    return this.rolePermissionRepository.findAllByRole(companyId, role.id);
  }
}
