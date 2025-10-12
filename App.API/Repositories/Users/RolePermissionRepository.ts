import { RolePermission } from "../../Entities/Users/RolePermission";
import { BaseRepository } from "../BaseRepository";

export class RolePermissionRepository extends BaseRepository<RolePermission> {
  constructor() {
    super(RolePermission);
  }

  async findByRoleIdAndPermissionId(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission | null> {
    return this.repository.findOne({ where: { roleId, permissionId } });
  }

  async findAllForRole(roleId: string): Promise<RolePermission[]> {
    return this.repository.find({ where: { roleId } });
  }
}
