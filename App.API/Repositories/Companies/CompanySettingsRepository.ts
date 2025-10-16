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
      } catch (error: any) {
        // Check if the error is a unique constraint violation
        if (error.code === '23505') { // PostgreSQL unique_violation error code
          // Another process created the settings concurrently, try to find them again
          settings = await this.findById(companyId);
          if (!settings) {
            throw error; // Re-throw if still not found (unexpected)
          }
        } else {
          throw error; // Re-throw other errors
        }
      }
    }
    return settings;
  }
}

Container.set('CompanySettingsRepository', new CompanySettingsRepository());
