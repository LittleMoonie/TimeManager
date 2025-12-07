import { startOfWeek, formatISO } from 'date-fns';
import cron from 'node-cron';
import { Inject, Service } from 'typedi';

import { TimesheetStatus } from '../Entities/Timesheets/Timesheet';
import { CompanyRepository } from '../Repositories/Companies/CompanyRepository';
import { CompanySettingsRepository } from '../Repositories/Companies/CompanySettingsRepository';
import { TimesheetRepository } from '../Repositories/Timesheets/TimesheetRepository';

import { TimesheetService } from './Timesheet/TimesheetService';

@Service()
export class SchedulingService {
  constructor(
    @Inject('CompanyRepository') private readonly companyRepository: CompanyRepository,
    @Inject('CompanySettingsRepository')
    private readonly companySettingsRepository: CompanySettingsRepository,
    @Inject('TimesheetRepository') private readonly timesheetRepository: TimesheetRepository,
    @Inject(() => TimesheetService) private readonly timesheetService: TimesheetService,
  ) {}

  public start(): void {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      const companies = await this.companyRepository.findAll();
      for (const company of companies) {
        try {
          const settings = await this.companySettingsRepository.getCompanySettings(company.id);
          const now = new Date();
          const timeZone = settings.timezone || 'UTC';
          const localHour = parseInt(
            now.toLocaleString('en-US', { timeZone, hour: '2-digit', hour12: false }),
            10,
          );

          if (localHour === 18) {
            const weekStart = this.getWeekStart(now);
            const timesheets = await this.timesheetRepository.findAllInCompanyForWeek(
              company.id,
              weekStart,
              TimesheetStatus.DRAFT,
            );
            for (const timesheet of timesheets) {
              await this.timesheetService.submitWeekTimesheet(
                company.id,
                timesheet.userId,
                weekStart,
              );
            }
          }
        } catch (error) {
          console.error(`Error processing company ${company.id}:`, error);
        }
      }
    });
  }

  private getWeekStart(date: Date): string {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    return formatISO(weekStart, { representation: 'date' });
  }
}
