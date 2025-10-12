import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import User from "@/Entities/Users/User";
import { UserRepository } from "@/Repositories/Users/UserRepository";
import ActiveSession from "@/Entities/Users/ActiveSessions";
import { NotFoundError } from "@/Errors/HttpErrors";

@Service()
export class AnonymizationService {
  constructor(
    @InjectRepository(User)
    private userRepository: UserRepository,
    @InjectRepository(ActiveSession)
    private activeSessionRepository: Repository<ActiveSession>,
  ) {}

  public async anonymizeUserData(userId: string, companyId: string): Promise<void> {
    const user = await this.userRepository.findByIdWithRelations(userId, companyId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Anonymize user's personal information
    user.firstName = "Deleted";
    user.lastName = "User";
    user.email = `deleted-${user.id}@gogotime.com`;
    user.phoneNumber = undefined;
    user.passwordHash = ""; // Invalidate password
    user.isAnonymized = true;

    await this.userRepository.update(user.id, user);

    // Hard delete related sensitive data
    await this.activeSessionRepository.delete({ userId: user.id });

    // Other related data could be handled here in the future
  }
}
