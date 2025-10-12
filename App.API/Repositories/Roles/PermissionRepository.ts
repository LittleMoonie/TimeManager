import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository, FindOneOptions } from "typeorm";

import { Permission } from "@/Entities/Roles/Permission";
import { BaseRepository } from "@/Repositories/BaseRepository";

@Service()
export class PermissionRepository extends BaseRepository<Permission> {
  constructor(
    @InjectRepository(Permission)
    repo: Repository<Permission>
  ) {
    super(Permission, repo);
  }

  async findByName(companyId: string, name: string): Promise<Permission | null> {
    const options: FindOneOptions<Permission> = {
      where: { companyId, name },
    };
    return this.repository.findOne(options);
  }

  async findAllInCompany(companyId: string): Promise<Permission[]> {
    return this.repository.find({ where: { companyId } });
  }
}
