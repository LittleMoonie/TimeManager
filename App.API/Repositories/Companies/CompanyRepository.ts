import { Service } from "typedi";
import { Company } from "../../Entities/Companies/Company";
import { BaseRepository } from "../../Repositories/BaseRepository";
import { NotFoundError } from "../../Errors/HttpErrors";

/**
 * @description Repository for managing Company entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for retrieving company information.
 */
@Service()
export class CompanyRepository extends BaseRepository<Company> {
  /**
   * @description Initializes the CompanyRepository.
   * The constructor automatically passes the Company entity to the BaseRepository.
   */
  constructor() {
    super(Company);
  }

  /**
   * @description Retrieves a single company by its unique identifier.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to the Company entity.
   * @throws {NotFoundError} If the company is not found.
   */
  async getCompanyById(companyId: string): Promise<Company> {
    const company = await this.findById(companyId);
    if (!company) throw new NotFoundError("Company not found");
    return company;
  }
}
