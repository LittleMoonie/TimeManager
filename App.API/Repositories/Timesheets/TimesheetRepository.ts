import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { FindOneOptions, Repository } from "typeorm";
import { Timesheet } from "../../Entities/Timesheets/Timesheet";
import { BaseRepository } from "../BaseRepository";

@Service()
export class TimesheetRepository extends BaseRepository<Timesheet> {
  constructor(@InjectRepository(Timesheet) repo: Repository<Timesheet>) {
    super(Timesheet, repo);
  }

  async findByPeriod(
    companyId: string,
    userId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<Timesheet | null> {
    const options: FindOneOptions<Timesheet> = {
      where: { companyId, userId, periodStart, periodEnd },
      relations: ["entries", "entries.actionCode"],
    };
    return this.repository.findOne(options);
  }

  async findAllForUser(companyId: string, userId: string): Promise<Timesheet[]> {
    return this.repository.find({
      where: { companyId, userId },
      relations: ["entries", "entries.actionCode"],
    });
  }
}
