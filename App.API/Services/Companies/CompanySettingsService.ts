import { Service } from "typedi";
import { validate } from "class-validator";

import { CompanySettingsRepository } from "@/Repositories/Companies/CompanySettingsRepository";
import { UpdateCompanySettingsDto } from "@/Dtos/Companies/CompanyDto";
import { CompanySettings } from "@/Entities/Companies/CompanySettings";
import { ForbiddenError, UnprocessableEntityError } from "@/Errors/HttpErrors";
import User from "@/Entities/Users/User";
import { RolePermissionService } from "@/Services/RoleService/RolePermissionService";

@Service()
export class CompanySettingsService {
  constructor(
    private readonly companySettingsRepository: CompanySettingsRepository,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map(e => e.toString()).join(", ")}`
      );
    }
  }

  async updateCompanySettings(
    actingUser: User,
    dto: UpdateCompanySettingsDto,
  ): Promise<CompanySettings> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, "update_company_settings"))) {
      throw new ForbiddenError("User does not have permission to update company settings.");
    }

    await this.ensureValidation(dto);
    await this.companySettingsRepository.getCompanySettings(actingUser.companyId);

    const updated = await this.companySettingsRepository.update(actingUser.companyId, dto);
    return updated!;
  }
}
