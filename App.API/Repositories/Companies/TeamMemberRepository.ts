import { Service } from "typedi";
import { TeamMember } from "@/Entities/Companies/Team";
import { BaseRepository } from "@/Repositories/BaseRepository";

@Service()
export class TeamMemberRepository extends BaseRepository<TeamMember> {
  constructor() {
    super(TeamMember);
  }

  async findAllForTeam(companyId: string, teamId: string): Promise<TeamMember[]> {
    return this.repository.find({
      where: { companyId, teamId },
      relations: ["user", "team"],
    });
  }

  async findByTeamAndUser(
    companyId: string,
    teamId: string,
    userId: string,
  ): Promise<TeamMember | null> {
    return this.repository.findOne({ where: { companyId, teamId, userId } });
  }
}
