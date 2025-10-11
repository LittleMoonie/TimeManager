import { FindOneOptions } from "typeorm";
import { Permission } from "../../Entities/Users/Permission";
import { BaseRepository } from "../BaseRepository";

export class PermissionRepository extends BaseRepository<Permission> {
  constructor() {
    super(Permission);
  }

  async findByName(
    companyId: string,
    name: string,
  ): Promise<Permission | null> {
    const options: FindOneOptions<Permission> = {
      where: { companyId, name },
    };
    return this.repository.findOne(options);
  }

  async findAll(companyId: string): Promise<Permission[]> {
    return this.repository.find({ where: { companyId } });
  }
}
