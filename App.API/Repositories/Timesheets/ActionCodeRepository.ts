import { FindOneOptions } from "typeorm";
import { ActionCode } from "../../Entities/Timesheets/ActionCode";
import { BaseRepository } from "../BaseRepository";

export class ActionCodeRepository extends BaseRepository<ActionCode> {
  constructor() {
    super(ActionCode);
  }

  async findByCode(
    companyId: string,
    code: string,
  ): Promise<ActionCode | null> {
    const options: FindOneOptions<ActionCode> = {
      where: { companyId, code },
    };
    return this.repository.findOne(options);
  }

  async findAll(companyId: string): Promise<ActionCode[]> {
    return this.repository.find({ where: { companyId } });
  }
}
