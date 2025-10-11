import { Company } from "../../Entities/Companies/Company";
import { BaseRepository } from "../BaseRepository";

export class CompanyRepository extends BaseRepository<Company> {
  constructor() {
    super(Company);
  }
}
