import { Service } from "typedi";
import { CompanySettingsRepository } from "../../Repositories/Companies/CompanySettingsRepository";
import { UpdateCompanySettingsDto } from "../../Dtos/Company/CompanySettingsDto";
import { CompanySettings } from "../../Entities/Companies/CompanySettings";
import { NotFoundError, ForbiddenError } from "../../Errors/HttpErrors";
import User from "../../Entities/Users/User";
import { RolePermissionService } from "../User/RolePermissionService";

@Service()
export class CompanySettingsService {
  constructor(
    private companySettingsRepository: CompanySettingsRepository,
    private rolePermissionService: RolePermissionService,
  ) {}

  public async getCompanySettings(companyId: string): Promise<CompanySettings> {
    const settings = await this.companySettingsRepository.findById(companyId);
    if (!settings) {
      throw new NotFoundError("Company settings not found");
    }
    return settings;
  }

  public async updateCompanySettings(
    actingUser: User,
    companyId: string,
    updateCompanySettingsDto: UpdateCompanySettingsDto,
  ): Promise<CompanySettings> {
    // Permission check: Only users with 'update_company_settings' permission can update company settings
    if (
      !(await this.rolePermissionService.checkPermission(
        actingUser,
        "update_company_settings",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to update company settings.",
      );
    }
    await this.getCompanySettings(companyId);
    const updatedSettings = await this.companySettingsRepository.update(
      companyId,
      updateCompanySettingsDto,
    );
    return updatedSettings!;
  }
}
