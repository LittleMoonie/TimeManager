import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import ActiveSession from "@/Entities/Users/ActiveSessions";
import { NotFoundError } from "@/Errors/HttpErrors";
import { UserRepository } from "@/Repositories/Users/UserRepository";

@Service()
export class AnonymizationService {
  constructor(
    private readonly userRepository: UserRepository,

    @InjectRepository(ActiveSession)
    private readonly activeSessionRepository: Repository<ActiveSession>,
  ) {}

  public async anonymizeUserData(userId: string, companyId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.companyId !== companyId) {
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
  }
}
