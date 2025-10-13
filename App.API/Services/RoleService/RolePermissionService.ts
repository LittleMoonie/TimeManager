import { Service } from 'typedi';
import { RolePermissionRepository } from '../../Repositories/Roles/RolePermissionRepository';
import { RolePermission } from '../../Entities/Roles/RolePermission';
import { ForbiddenError, NotFoundError } from '../../Errors/HttpErrors';
import { CreateRolePermissionDto } from '../../Dtos/Roles/RoleDto';
import User from '../../Entities/Users/User';

/**
 * @description Service layer for managing RolePermission entities. This service provides business logic
 * for checking user permissions and managing role-permission associations.
 */
@Service()
export class RolePermissionService {
  /**
   * @description Initializes the RolePermissionService with the RolePermissionRepository.
   * @param rolePermissionRepository The repository for RolePermission entities, injected by TypeDI.
   */
  constructor(private readonly rolePermissionRepository: RolePermissionRepository) {}

  /**
   * @description Checks if a given user has a specific permission.
   * @param user The user object to check permissions for.
   * @param permissionName The name of the permission to check for.
   * @returns {Promise<boolean>} A Promise that resolves to `true` if the user has the permission, `false` otherwise.
   */
  public async checkPermission(user: User, permissionName: string): Promise<boolean> {
    if (!user?.role?.rolePermissions?.length) return false;
    return user.role.rolePermissions.some((rp) => rp.permission?.name === permissionName);
  }

  /**
   * @description Retrieves a role-permission association by its unique identifier within a specific company.
   * @param companyId The unique identifier of the company.
   * @param id The unique identifier of the role-permission association.
   * @returns A Promise that resolves to the RolePermission entity.
   * @throws {NotFoundError} If the role-permission association is not found or does not belong to the specified company.
   */
  public async getRolePermissionById(companyId: string, id: string): Promise<RolePermission> {
    const link = await this.rolePermissionRepository.findById(id);
    if (!link || link.companyId !== companyId) {
      throw new NotFoundError('RolePermission not found');
    }
    return link;
  }

  /**
   * @description Creates a new role-permission association. Requires 'create_role_permission' permission.
   * If the association already exists, it returns the existing one (idempotent).
   * @param currentUser The user performing the action.
   * @param companyId The unique identifier of the company.
   * @param createRolePermissionDto The DTO containing the role ID and permission ID to associate.
   * @returns A Promise that resolves to the created or existing RolePermission entity.
   * @throws {ForbiddenError} If the current user does not have 'create_role_permission' permission.
   */
  public async createRolePermission(
    currentUser: User,
    companyId: string,
    createRolePermissionDto: CreateRolePermissionDto,
  ): Promise<RolePermission> {
    if (!(await this.checkPermission(currentUser, 'create_role_permission'))) {
      throw new ForbiddenError('User does not have permission to create role permissions.');
    }

    const existing = await this.rolePermissionRepository.findByRoleAndPermission(
      companyId,
      createRolePermissionDto.roleId,
      createRolePermissionDto.permissionId,
    );
    if (existing) return existing;

    return this.rolePermissionRepository.create({
      companyId,
      ...createRolePermissionDto,
    });
  }

  /**
   * @description Deletes a role-permission association. Requires 'delete_role_permission' permission.
   * @param currentUser The user performing the action.
   * @param companyId The unique identifier of the company.
   * @param id The unique identifier of the role-permission association to delete.
   * @returns A Promise that resolves when the deletion is complete.
   * @throws {ForbiddenError} If the current user does not have 'delete_role_permission' permission.
   * @throws {NotFoundError} If the role-permission association is not found or does not belong to the specified company.
   */
  public async deleteRolePermission(
    currentUser: User,
    companyId: string,
    id: string,
  ): Promise<void> {
    if (!(await this.checkPermission(currentUser, 'delete_role_permission'))) {
      throw new ForbiddenError('User does not have permission to delete role permissions.');
    }

    const link = await this.rolePermissionRepository.findById(id);
    if (!link || link.companyId !== companyId) {
      throw new NotFoundError('RolePermission not found');
    }
    await this.rolePermissionRepository.removeById(companyId, id);
  }
}
