import { Team } from "../../Entities/Companies/Team";
import { BaseRepository } from "../BaseRepository";

export class TeamRepository extends BaseRepository<Team> {
  constructor() {
    super(Team);
  }

  async findAll(companyId: string): Promise<Team[]> {
    return this.repository.find({ where: { companyId } });
  }
}
