import { Service } from "typedi";
import { Company } from "@/Entities/Companies/Company";
import { BaseRepository } from "@/Repositories/BaseRepository";
import { NotFoundError } from "@/Errors/HttpErrors";

@Service()
export class CompanyRepository extends BaseRepository<Company> {
  constructor() {
    super(Company);
  }

  async getCompanyById(companyId: string): Promise<Company> {
    const company = await this.findById(companyId);
    if (!company) throw new NotFoundError("Company not found");
    return company;
  }
}
