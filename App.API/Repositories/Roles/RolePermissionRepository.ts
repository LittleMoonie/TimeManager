import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";

import { BaseRepository } from "@/Repositories/BaseRepository";
import { RolePermission } from "@/Entities/Roles/RolePermission";

@Service()
export class RolePermissionRepository extends BaseRepository<RolePermission> {
  constructor(
    @InjectRepository(RolePermission)
    repo: Repository<RolePermission>
  ) {
    super(RolePermission, repo);
  }

  async findAllByRole(companyId: string, roleId: string): Promise<RolePermission[]> {
    return this.repository.find({
      where: { companyId, roleId },
      relations: ["permission", "role"],
    });
  }

  async findByRoleAndPermission(
    companyId: string,
    roleId: string,
    permissionId: string
  ): Promise<RolePermission | null> {
    return this.repository.findOne({
      where: { companyId, roleId, permissionId },
      relations: ["permission", "role"],
    });
  }

  async removeById(companyId: string, id: string): Promise<void> {
    await this.repository.delete({ companyId, id });
  }
}
