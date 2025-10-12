import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";

import { BaseRepository } from "@/Repositories/BaseRepository";
import { Role } from "@/Entities/Roles/Role";

@Service()
export class RoleRepository extends BaseRepository<Role> {
  constructor(
    @InjectRepository(Role)
    repo: Repository<Role>
  ) {
    super(Role, repo);
  }

  async findAllByCompanyId(companyId: string): Promise<Role[]> {
    return this.repository.find({
      where: { companyId },
      relations: ["rolePermissions", "rolePermissions.permission"],
    });
  }

  async findByIdInCompany(id: string, companyId: string): Promise<Role | null> {
    return this.repository.findOne({
      where: { id, companyId },
      relations: ["rolePermissions", "rolePermissions.permission"],
    });
  }

  async findByNameInCompany(name: string, companyId: string): Promise<Role | null> {
    return this.repository.findOne({
      where: { name, companyId },
      relations: ["rolePermissions", "rolePermissions.permission"],
    });
  }
}
