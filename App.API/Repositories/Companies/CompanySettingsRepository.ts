import Container, { Service } from 'typedi';

import { ApproverPolicy, CompanySettings } from '../../Entities/Companies/CompanySettings';
import { NotFoundError } from '../../Errors/HttpErrors';
import { BaseRepository } from '../../Repositories/BaseRepository';

/**
 * @description Repository for managing CompanySettings entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for retrieving company settings.
 */
@Service('CompanySettingsRepository')
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
    let settings = await this.findById(companyId);
    if (!settings) {
      try {
        settings = await this.create({
          companyId,
          defaultCountryCode: 'US', // Default to US
          defaultLocation: 'Office',
          maxWeeklyMinutes: 2400,
          timezone: 'UTC',
          workWeek: {},
          timesheetApproverPolicy: ApproverPolicy.MANAGER_OF_USER,
          requireCompanyEmail: false,
          officeCountryCodes: ['US'], // Default office country code
        });
      } catch (error) {
        // If creation fails due to a unique constraint violation (e.g., another request created it),
        // try to find it again.
        settings = await this.findById(companyId);
        if (!settings) {
          throw error; // Re-throw if still not found (unexpected)
        }
      }
    }
    return settings;
  }
}

Container.set('CompanySettingsRepository', new CompanySettingsRepository());
