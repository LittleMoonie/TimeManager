import { CompanySettings } from "../../Entities/Companies/CompanySettings";
import { BaseRepository } from "../BaseRepository";

export class CompanySettingsRepository extends BaseRepository<CompanySettings> {
  constructor() {
    super(CompanySettings);
  }
}
