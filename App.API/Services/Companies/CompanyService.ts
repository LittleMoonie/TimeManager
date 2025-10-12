import { Service } from "typedi";
import { validate } from "class-validator";

import { CompanyRepository } from "@/Repositories/Companies/CompanyRepository";
import { Company } from "@/Entities/Companies/Company";
import { CreateCompanyDto, UpdateCompanyDto } from "@/Dtos/Companies/CompanyDto";
import { UnprocessableEntityError } from "@/Errors/HttpErrors";

@Service()
export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map(e => e.toString()).join(", ")}`
      );
    }
  }

  async createCompany(dto: CreateCompanyDto): Promise<Company> {
    await this.ensureValidation(dto);
    return this.companyRepository.create(dto as Company);
  }

  async updateCompany(companyId: string, dto: UpdateCompanyDto): Promise<Company> {
    await this.ensureValidation(dto);
    const existing = await this.companyRepository.getCompanyById(companyId);
    existing.name = dto.name ?? existing.name;
    existing.timezone = dto.timezone ?? existing.timezone;
    return this.companyRepository.save(existing);
  }
}
