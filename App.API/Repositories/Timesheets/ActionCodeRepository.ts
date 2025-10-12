import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { ILike, Repository } from "typeorm";
import { BaseRepository } from "../BaseRepository";
import { ActionCode } from "../../Entities/Timesheets/ActionCode";

/**
 * Repository for ActionCode entities (timesheet action labeling).
 * All queries are explicitly scoped by companyId for multi-tenant safety.
 */
@Service()
export class ActionCodeRepository extends BaseRepository<ActionCode> {
  constructor(@InjectRepository(ActionCode) repo: Repository<ActionCode>) {
    super(ActionCode, repo);
  }

  async findByCode(companyId: string, code: string): Promise<ActionCode | null> {
    return this.repository.findOne({ where: { companyId, code } });
  }

  async findAllInCompany(companyId: string): Promise<ActionCode[]> {
    return this.repository.find({ where: { companyId } });
  }

  async search(companyId: string, q?: string): Promise<ActionCode[]> {
    if (!q || !q.trim()) return this.findAllInCompany(companyId);
    const term = `%${q.trim()}%`;
    return this.repository.find({
      where: [
        { companyId, name: ILike(term) },
        { companyId, code: ILike(term) },
      ],
      order: { createdAt: "DESC" } as any,
    });
  }
}
