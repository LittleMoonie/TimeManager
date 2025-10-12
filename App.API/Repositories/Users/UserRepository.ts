import { FindOneOptions } from "typeorm";
import User from "../../Entities/Users/User";
import { BaseRepository } from "../BaseRepository";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByIdWithRelations(
    companyId: string,
    userId: string,
  ): Promise<User | null> {
    const options: FindOneOptions<User> = {
      where: { companyId, id: userId },
      relations: [
        "role",
        "role.rolePermissions",
        "role.rolePermissions.permission",
        "status",
      ],
    };
    return this.repository.findOne(options);
  }

  async findByEmailWithRelations(
    companyId: string,
    email: string,
  ): Promise<User | null> {
    const options: FindOneOptions<User> = {
      where: { companyId, email },
      relations: [
        "role",
        "role.rolePermissions",
        "role.rolePermissions.permission",
        "status",
      ],
    };
    return this.repository.findOne(options);
  }

  async findAllByCompanyId(companyId: string): Promise<User[]> {
    return this.repository.find({
      where: { companyId },
      relations: ["role", "status"],
    });
  }

  async hardDelete(userId: string): Promise<void> {
    await this.repository.delete(userId);
  }
}
