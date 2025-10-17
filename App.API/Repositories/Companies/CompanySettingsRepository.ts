import Container, { Service } from 'typedi';

import { ApproverPolicy, CompanySettings } from '../../Entities/Companies/CompanySettings';
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
    try {
      // Attempt to create settings first. If they already exist, this will throw a unique constraint error.
      const settings = await this.create({
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
      return settings;
    } catch (error: unknown) {
      // If creation fails due to a unique constraint violation (e.g., another request created it),
      // try to find it again.
      if (error.code === '23505') {
        // PostgreSQL unique_violation error code
        const existingSettings = await this.findById(companyId);
        if (existingSettings) {
          return existingSettings;
        }
      }
      throw error; // Re-throw other errors or if still not found
    }
  }
}

Container.set('CompanySettingsRepository', new CompanySettingsRepository());
