import { Request as ExpressRequest } from 'express';
import { Controller, Get, Request, Route, Security, Tags } from 'tsoa';
import { Inject, Service } from 'typedi';

import { CompanySettingsRepository } from '../../Repositories/Companies/CompanySettingsRepository';
import User from '../../Entities/Users/User';
import { COUNTRY_CATALOG } from '../../Utils/countries';

@Route('company/countries')
@Tags('Countries')
@Security('jwt')
@Service()
export class CompanyCountryController extends Controller {
  constructor(
    @Inject('CompanySettingsRepository')
    private readonly companySettingsRepository: CompanySettingsRepository,
  ) {
    super();
  }

  @Get('/')
  public async listCountries(
    @Request() request: ExpressRequest,
  ): Promise<Array<{ code: string; name: string; hasOffice: boolean }>> {
    const actingUser = request.user as User;

    let officeCodes: string[] = [];
    try {
      const settings = await this.companySettingsRepository.getCompanySettings(
        actingUser.companyId,
      );
      officeCodes = (settings.officeCountryCodes ?? []).map((code) => code.toUpperCase());
      const defaultCountry = settings.defaultCountryCode
        ? settings.defaultCountryCode.toUpperCase()
        : undefined;
      if (defaultCountry) {
        if (officeCodes.length === 0) {
          officeCodes = [defaultCountry];
        } else if (!officeCodes.includes(defaultCountry)) {
          officeCodes.push(defaultCountry);
        }
      }
    } catch {
      officeCodes = [];
    }
    const officeSet = new Set(officeCodes);

    return COUNTRY_CATALOG.map((country) => ({
      code: country.code,
      name: country.name,
      hasOffice: officeSet.has(country.code.toUpperCase()),
    }));
  }
}
