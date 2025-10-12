import { FindOneOptions } from "typeorm";
import { Timesheet } from "../../Entities/Timesheets/Timesheet";
import { BaseRepository } from "../BaseRepository";

export class TimesheetRepository extends BaseRepository<Timesheet> {
  constructor() {
    super(Timesheet);
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

  async findAllForUser(
    companyId: string,
    userId: string,
  ): Promise<Timesheet[]> {
    return this.repository.find({
      where: { companyId, userId },
      relations: ["entries", "entries.actionCode"],
    });
  }
}
