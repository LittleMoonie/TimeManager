import { UserStatus } from "../../Entities/Users/UserStatus";
import { BaseRepository } from "../BaseRepository";

export class UserStatusRepository extends BaseRepository<UserStatus> {
  constructor() {
    super(UserStatus);
  }

  async findByCode(code: string): Promise<UserStatus | null> {
    return this.repository.findOne({ where: { code } });
  }

  async findAll(): Promise<UserStatus[]> {
    return this.repository.find();
  }
}
