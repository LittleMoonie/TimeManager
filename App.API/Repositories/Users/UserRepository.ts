
import User from "../../Entities/Users/User";
import { BaseRepository } from "../BaseRepository";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
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
