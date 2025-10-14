import { Inject, Service } from 'typedi';
import { validate } from 'class-validator';

import { CompanySettingsRepository } from '../../Repositories/Companies/CompanySettingsRepository';
import { UpdateCompanySettingsDto } from '../../Dtos/Companies/CompanyDto';
import { CompanySettings } from '../../Entities/Companies/CompanySettings';
import { ForbiddenError, UnprocessableEntityError } from '../../Errors/HttpErrors';
import User from '../../Entities/Users/User';
import { RolePermissionService } from '../../Services/RoleService/RolePermissionService';

/**
 * @description Service layer for managing CompanySettings entities. This service provides business logic
 * for updating company settings, with integrated permission checks.
 */
@Service()
export class CompanySettingsService {
  /**
   * @description Initializes the CompanySettingsService with necessary repositories and services.
   * @param companySettingsRepository The repository for CompanySettings entities.
   * @param rolePermissionService The service for checking user permissions.
   */
  constructor(
    @Inject('CompanySettingsRepository')
    private readonly companySettingsRepository: CompanySettingsRepository,
    @Inject('RolePermissionService') private readonly rolePermissionService: RolePermissionService,
  ) {}

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
   * @description Retrieves company settings for a specific company.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to the CompanySettings entity.
   * @throws {NotFoundError} If company settings are not found for the given company ID.
   */
  async getCompanySettings(companyId: string): Promise<CompanySettings> {
    return this.companySettingsRepository.getCompanySettings(companyId);
  }

  /**
   * @description Creates new company settings for a specific company.
   * @param companyId The unique identifier of the company.
   * @param settings The CompanySettings object to create.
   * @returns A Promise that resolves to the newly created CompanySettings entity.
   */
  /**
   * @description Creates new company settings for a specific company.
   * @param companyId The unique identifier of the company.
   * @param settings The CompanySettings object to create.
   * @returns A Promise that resolves to the newly created CompanySettings entity.
   */
  async createCompanySettings(
    companyId: string,
    settings: CompanySettings,
  ): Promise<CompanySettings> {
    return this.companySettingsRepository.create({ ...settings, companyId });
  }

  /**
   * @description Updates the company settings for the acting user's company. Requires 'update_company_settings' permission.
   * @param actingUser The user performing the action.
   * @param dto The UpdateCompanySettingsDto containing the updated company settings data.
   * @returns A Promise that resolves to the updated CompanySettings entity.
   * @throws {ForbiddenError} If the acting user does not have permission to update company settings.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   * @throws {NotFoundError} If the company settings are not found.
   */
  async updateCompanySettings(
    actingUser: User,
    dto: UpdateCompanySettingsDto,
  ): Promise<CompanySettings> {
    if (
      !(await this.rolePermissionService.checkPermission(actingUser, 'update_company_settings'))
    ) {
      throw new ForbiddenError('User does not have permission to update company settings.');
    }

    await this.ensureValidation(dto);
    await this.companySettingsRepository.getCompanySettings(actingUser.companyId);

    const updated = await this.companySettingsRepository.update(actingUser.companyId, dto);
    return updated!;
  }

  /**
   * @description Deletes company settings for a specific company.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves when the deletion is complete.
   * @throws {NotFoundError} If company settings are not found for the given company ID.
   */
  async deleteCompanySettings(companyId: string): Promise<void> {
    const settings = await this.companySettingsRepository.getCompanySettings(companyId);
    await this.companySettingsRepository.delete(settings.id);
  }
}
