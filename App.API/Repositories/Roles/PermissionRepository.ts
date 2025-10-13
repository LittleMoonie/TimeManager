import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository, FindOneOptions } from 'typeorm';

import { Permission } from '../../Entities/Roles/Permission';
import { BaseRepository } from '../../Repositories/BaseRepository';

/**
 * @description Repository for managing Permission entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying permissions within a company scope.
 */
@Service()
export class PermissionRepository extends BaseRepository<Permission> {
  /**
   * @description Initializes the PermissionRepository with a TypeORM Repository instance for Permission.
   * @param repo The TypeORM Repository<Permission> injected by TypeDI.
   */
  constructor(
    @InjectRepository(Permission)
    repo: Repository<Permission>,
  ) {
    super(Permission, repo);
  }

  /**
   * @description Finds a single permission by its name within a specific company.
   * @param companyId The unique identifier of the company.
   * @param name The name of the permission to find.
   * @returns A Promise that resolves to the Permission entity or null if not found.
   */
  async findByName(companyId: string, name: string): Promise<Permission | null> {
    const options: FindOneOptions<Permission> = {
      where: { companyId, name },
    };
    return this.repository.findOne(options);
  }

  /**
   * @description Finds all permissions belonging to a specific company.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to an array of Permission entities.
   */
  async findAllInCompany(companyId: string): Promise<Permission[]> {
    return this.repository.find({ where: { companyId } });
  }
}
