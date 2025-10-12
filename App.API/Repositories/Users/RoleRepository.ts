
import { Role } from "../../Entities/Users/Role";
import { BaseRepository } from "../BaseRepository";

export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super(Role);
  }

  async addPermission(companyId: string, roleId: string, permissionId: string): Promise<void> {
    await this.repository.save({
      companyId,
      roleId,
      permissionId
    });
  }

  async removePermission(companyId: string, id: string): Promise<void> {
    await this.repository.delete({ companyId, id });
  }
}
