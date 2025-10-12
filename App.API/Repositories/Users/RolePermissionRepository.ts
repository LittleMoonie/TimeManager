import { RolePermission } from "../../Entities/Users/RolePermission";
import { BaseRepository } from "../BaseRepository";

export class RolePermissionRepository extends BaseRepository<RolePermission> {
  constructor() {
    super(RolePermission);
  }
}
