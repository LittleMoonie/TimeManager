import { Service } from 'typedi';

import { RolePermission } from '../../Entities/Roles/RolePermission';
import { BaseRepository } from '../../Repositories/BaseRepository';

/**
 * @description Repository for managing RolePermission entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying and managing role-permission associations.
 */
@Service('RolePermissionRepository')
export class RolePermissionRepository extends BaseRepository<RolePermission> {
  /**
   * @description Initializes the RolePermissionRepository with a TypeORM Repository instance for RolePermission.
   * @param repo The TypeORM Repository<RolePermission> injected by TypeDI.
   */
  constructor() {
    super(RolePermission);
  }

  /**
   * @description Finds all role-permission associations for a specific role within a given company.
   * Includes related permission and role details.
   * @param companyId The unique identifier of the company.
   * @param roleId The unique identifier of the role.
   * @returns A Promise that resolves to an array of RolePermission entities.
   */
  async findAllByRole(companyId: string, roleId: string): Promise<RolePermission[]> {
    return this.repository.find({
      where: { companyId, roleId },
      relations: ['permission', 'role'],
    });
  }

  /**
   * @description Finds a specific role-permission association by role ID, permission ID, and company ID.
   * Includes related permission and role details.
   * @param companyId The unique identifier of the company.
   * @param roleId The unique identifier of the role.
   * @param permissionId The unique identifier of the permission.
   * @returns A Promise that resolves to the matching RolePermission entity or null if not found.
   */
  async findByRoleAndPermission(
    companyId: string,
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission | null> {
    return this.repository.findOne({
      where: { companyId, roleId, permissionId },
      relations: ['permission', 'role'],
    });
  }

  /**
   * @description Removes a role-permission association by its ID within a specific company.
   * @param companyId The unique identifier of the company.
   * @param id The unique identifier of the role-permission association to remove.
   * @returns A Promise that resolves when the removal is complete.
   */
  async removeById(companyId: string, id: string): Promise<void> {
    await this.repository.delete({ companyId, id });
  }
}
