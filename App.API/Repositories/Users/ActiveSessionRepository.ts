import ActiveSession from "../../Entities/Users/ActiveSessions";
import { BaseRepository } from "../BaseRepository";

export class ActiveSessionRepository extends BaseRepository<ActiveSession> {
  constructor() {
    super(ActiveSession);
  }

  async findByTokenHash(tokenHash: string): Promise<ActiveSession | null> {
    return this.repository.findOne({ where: { tokenHash } });
  }
}
