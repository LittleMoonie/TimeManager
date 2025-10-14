import { Service } from 'typedi';

import { BaseRepository } from '../../Repositories/BaseRepository';
import { Role } from '../../Entities/Roles/Role';

/**
 * @description Repository for managing Role entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying roles within a company scope.
 */
@Service('RoleRepository')
export class RoleRepository extends BaseRepository<Role> {
  /**
   * @description Initializes the RoleRepository with a TypeORM Repository instance for Role.
   * @param repo The TypeORM Repository<Role> injected by TypeDI.
   */
  constructor() {
    super(Role);
  }

  /**
   * @description Finds all roles associated with a specific company ID.
   * Includes related role permissions and their corresponding permission details.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to an array of Role entities.
   */
  async findAllByCompanyId(companyId: string): Promise<Role[]> {
    return this.repository.find({
      where: { companyId },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
  }

  /**
   * @description Finds a single role by its ID within a specific company.
   * Includes related role permissions and their corresponding permission details.
   * @param id The unique identifier of the role.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to the Role entity or null if not found.
   */
  async findByIdInCompany(id: string, companyId: string): Promise<Role | null> {
    return this.repository.findOne({
      where: { id, companyId },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
  }

  /**
   * @description Finds a single role by its name within a specific company.
   * Includes related role permissions and their corresponding permission details.
   * @param name The name of the role.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to the Role entity or null if not found.
   */
  async findByNameInCompany(name: string, companyId: string): Promise<Role | null> {
    return this.repository.findOne({
      where: { name, companyId },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
  }
}
