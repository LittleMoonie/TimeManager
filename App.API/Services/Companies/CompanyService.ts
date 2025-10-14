import { Inject, Service } from 'typedi';
import { validate } from 'class-validator';

import { CompanyRepository } from '../../Repositories/Companies/CompanyRepository';
import { Company } from '../../Entities/Companies/Company';
import { CreateCompanyDto, UpdateCompanyDto } from '../../Dtos/Companies/CompanyDto';
import { UnprocessableEntityError } from '../../Errors/HttpErrors';

/**
 * @description Service layer for managing Company entities. This service provides business logic
 * for creating and updating company information.
 */
export class CompanyService {
  /**
   * @description Initializes the CompanyService with the CompanyRepository.
   * @param companyRepository The repository for Company entities, injected by TypeDI.
   */
  constructor(@Inject('CompanyRepository') private readonly companyRepository: CompanyRepository) {}

  /**
   * @description Ensures that a given DTO (Data Transfer Object) is valid by performing class-validator validation.
   * @param dto The DTO object to validate.
   * @returns A Promise that resolves if validation passes.
   * @throws {UnprocessableEntityError} If validation fails, containing details of the validation errors.
   */
  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(', ')}`,
      );
    }
  }

  /**
   * @description Gets a company by its ID.
   * @param companyId The unique identifier of the company to get.
   * @returns A Promise that resolves to the Company entity.
   * @throws {NotFoundError} If the company is not found.
   */
  async getCompanyById(companyId: string): Promise<Company> {
    return this.companyRepository.getCompanyById(companyId);
  }

  /**
   * @description Gets all companies.
   * @returns {Promise<Company[]>} A Promise that resolves to an array of Company entities.
   */
  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepository.findAll();
  }

  /**
   * @description Creates a new company.
   * @param dto The CreateCompanyDto containing the data for the new company.
   * @returns A Promise that resolves to the newly created Company entity.
   * @throws {UnprocessableEntityError} If validation fails.
   */
  async createCompany(dto: CreateCompanyDto): Promise<Company> {
    await this.ensureValidation(dto);
    return this.companyRepository.create(dto as Company);
  }

  /**
   * @description Updates an existing company.
   * @param companyId The unique identifier of the company to update.
   * @param dto The UpdateCompanyDto containing the updated data for the company.
   * @returns A Promise that resolves to the updated Company entity.
   * @throws {UnprocessableEntityError} If validation fails.
   * @throws {NotFoundError} If the company to update is not found.
   */
  async updateCompany(companyId: string, dto: UpdateCompanyDto): Promise<Company> {
    await this.ensureValidation(dto);
    const existing = await this.companyRepository.getCompanyById(companyId);
    existing.name = dto.name ?? existing.name;
    existing.timezone = dto.timezone ?? existing.timezone;
    return this.companyRepository.save(existing);
  }

  /**
   * @description Soft deletes a company by its ID.
   * @param companyId The unique identifier of the company to soft delete.
   * @returns A Promise that resolves when the soft deletion is complete.
   * @throws {NotFoundError} If the company is not found.
   */
  async softDeleteCompany(companyId: string): Promise<void> {
    const company = await this.companyRepository.getCompanyById(companyId);
    await this.companyRepository.softDelete(company.id);
  }

  /**
   * @description Permanently deletes a company by its ID. This operation is irreversible.
   * @param companyId The unique identifier of the company to hard delete.
   * @returns A Promise that resolves when the hard deletion is complete.
   * @throws {NotFoundError} If the company is not found.
   */
  async hardDeleteCompany(companyId: string): Promise<void> {
    const company = await this.companyRepository.getCompanyById(companyId);
    await this.companyRepository.delete(company.id);
  }
}
