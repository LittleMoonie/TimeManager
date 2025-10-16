import { DataSource } from 'typeorm';

import { Company } from '../Entities/Companies/Company';
import { CompanySettings } from '../Entities/Companies/CompanySettings';
import {
  TimesheetRow,
  TimesheetRowBillableTag,
  TimesheetRowLocation,
  TimesheetRowStatus,
} from '../Entities/Timesheets/TimesheetRow';

const NORMALISED_LOCATIONS = new Set<string>(Object.values(TimesheetRowLocation));
const NORMALISED_BILLABLE = new Set(Object.values(TimesheetRowBillableTag));
const NORMALISED_STATUS = new Set(Object.values(TimesheetRowStatus));

export const seedCompanySettings = async (ds: DataSource, company: Company) => {
  const settingsRepo = ds.getRepository(CompanySettings);
  const rowRepo = ds.getRepository(TimesheetRow);

  let settings = await settingsRepo.findOne({ where: { companyId: company.id } });

  if (!settings) {
    settings = settingsRepo.create({
      companyId: company.id,
      defaultCountryCode: 'US',
      defaultLocation: TimesheetRowLocation.OFFICE,
      officeCountryCodes: ['US'],
      maxWeeklyMinutes: 2400,
    });
    await settingsRepo.save(settings);
    console.warn('🏢 Seeded company settings for', company.name);
  } else {
    let changed = false;

    if (!settings.defaultCountryCode) {
      settings.defaultCountryCode = 'US';
      changed = true;
    }
    if (!settings.defaultLocation || !NORMALISED_LOCATIONS.has(settings.defaultLocation)) {
      settings.defaultLocation = TimesheetRowLocation.OFFICE;
      changed = true;
    }
    if (!settings.officeCountryCodes || settings.officeCountryCodes.length === 0) {
      settings.officeCountryCodes = [settings.defaultCountryCode ?? 'US'];
      changed = true;
    }
    if (changed) {
      await settingsRepo.save(settings);
      console.warn('🛠️ Updated company settings defaults for', company.name);
    }
  }

  const defaultCountry = settings.defaultCountryCode ?? 'US';

  const rowsNeedingUpdate = await rowRepo.find({
    where: { companyId: company.id },
  });

  let normalisedCount = 0;
  for (const row of rowsNeedingUpdate) {
    let touched = false;

    if (!row.countryCode) {
      row.countryCode = defaultCountry;
      touched = true;
    } else if (row.countryCode.length !== 2) {
      row.countryCode = row.countryCode.slice(0, 2).toUpperCase();
      touched = true;
    }

    if (!row.location || !NORMALISED_LOCATIONS.has(row.location)) {
      row.location = TimesheetRowLocation.OFFICE;
      touched = true;
    }

    if (row.location === TimesheetRowLocation.OFFICE) {
      if (row.employeeCountryCode !== null) {
        row.employeeCountryCode = null;
        touched = true;
      }
    } else {
      const desiredEmployeeCountry = row.employeeCountryCode ?? row.countryCode ?? defaultCountry;
      if (row.employeeCountryCode !== desiredEmployeeCountry) {
        row.employeeCountryCode = desiredEmployeeCountry;
        touched = true;
      }
    }

    if (!row.billable || !NORMALISED_BILLABLE.has(row.billable)) {
      row.billable = TimesheetRowBillableTag.AUTO;
      touched = true;
    }

    if (!row.status || !NORMALISED_STATUS.has(row.status)) {
      row.status = TimesheetRowStatus.DRAFT;
      touched = true;
    }

    if (row.locked === undefined || row.locked === null) {
      row.locked = false;
      touched = true;
    }

    if (touched) {
      await rowRepo.save(row);
      normalisedCount += 1;
    }
  }

  if (normalisedCount > 0) {
    console.warn(`🧹 Normalised ${normalisedCount} existing timesheet rows for ${company.name}`);
  }
};
