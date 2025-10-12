import { Service } from "typedi";
import { CompanyRepository } from "../../Repositories/Companies/CompanyRepository";
import { CreateCompanyDto } from "../../Dtos/Company/CompanyDto";
import { Company } from "../../Entities/Companies/Company";

@Service()
export class CompanyService {
  constructor(private companyRepository: CompanyRepository) {}

  public async createCompany(
    createCompanyDto: CreateCompanyDto,
  ): Promise<Company> {
    return this.companyRepository.create(createCompanyDto);
  }
}
