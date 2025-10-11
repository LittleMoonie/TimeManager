import { FindOneOptions } from "typeorm";
import { Role } from "../../Entities/Users/Role";
import { BaseRepository } from "../BaseRepository";

export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super(Role);
  }

  async findByIdWithRelations(
    companyId: string,
    roleId: string,
  ): Promise<Role | null> {
    const options: FindOneOptions<Role> = {
      where: { companyId, id: roleId },
      relations: ["rolePermissions", "rolePermissions.permission"],
    };
    return this.repository.findOne(options);
  }

  async findByNameWithRelations(
    companyId: string,
    name: string,
  ): Promise<Role | null> {
    const options: FindOneOptions<Role> = {
      where: { companyId, name },
      relations: ["rolePermissions", "rolePermissions.permission"],
    };
    return this.repository.findOne(options);
  }

  async findAll(companyId: string): Promise<Role[]> {
    return this.repository.find({
      where: { companyId },
      relations: ["rolePermissions", "rolePermissions.permission"],
    });
  }
}
