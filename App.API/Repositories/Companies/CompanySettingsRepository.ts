import { Service } from "typedi";
import { CompanySettings } from "@/Entities/Companies/CompanySettings";
import { BaseRepository } from "@/Repositories/BaseRepository";
import { NotFoundError } from "@/Errors/HttpErrors";

@Service()
export class CompanySettingsRepository extends BaseRepository<CompanySettings> {
  constructor() {
    super(CompanySettings);
  }

  async getCompanySettings(companyId: string): Promise<CompanySettings> {
    const settings = await this.findById(companyId);
    if (!settings) {
      throw new NotFoundError("Company settings not found");
    }
    return settings;
  }
}
