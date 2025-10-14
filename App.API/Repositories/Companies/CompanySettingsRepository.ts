import Container, { Service } from 'typedi';
import { CompanySettings } from '../../Entities/Companies/CompanySettings';
import { BaseRepository } from '../../Repositories/BaseRepository';
import { NotFoundError } from '../../Errors/HttpErrors';

/**
 * @description Repository for managing CompanySettings entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for retrieving company settings.
 */
export class CompanySettingsRepository extends BaseRepository<CompanySettings> {
  /**
   * @description Initializes the CompanySettingsRepository.
   * The constructor automatically passes the CompanySettings entity to the BaseRepository.
   */
  constructor() {
    super(CompanySettings);
  }

  /**
   * @description Retrieves the company settings for a given company ID.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to the CompanySettings entity.
   * @throws {NotFoundError} If the company settings are not found for the specified company ID.
   */
  async getCompanySettings(companyId: string): Promise<CompanySettings> {
    const settings = await this.findById(companyId);
    if (!settings) {
      throw new NotFoundError('Company settings not found');
    }
    return settings;
  }
}

Container.set('CompanySettingsRepository', CompanySettingsRepository);
