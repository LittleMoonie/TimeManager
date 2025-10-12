import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import User from "@/Entities/Users/User";
import ActiveSession from "@/Entities/Users/ActiveSessions";

@Service()
export class AuthenticationRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(ActiveSession)
    private readonly activeSessionRepo: Repository<ActiveSession>
  ) {}

  /** Find user by email with all relations needed for login/auth checks. */
  async findUserByEmailWithAuthRelations(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      relations: [
        "status",
        "company",
        "role",
        "role.rolePermissions",
        "role.rolePermissions.permission",
      ],
    });
  }

  /** Persist a user (e.g., after lastLogin update). */
  async saveUser(user: User): Promise<User> {
    return this.userRepo.save(user);
  }

  /** Get user by id with basic relations (for 'me' from refresh). */
  async findUserByIdWithBasicRelations(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: ["status", "company", "role"],
    });
  }

  /** Create a lightweight ActiveSession row (e.g., to persist tokenHash/device metadata). */
  async createAndSaveActiveSessionPartial(data: Partial<ActiveSession>): Promise<ActiveSession> {
    const entity = this.activeSessionRepo.create(data);
    return this.activeSessionRepo.save(entity);
  }
}
