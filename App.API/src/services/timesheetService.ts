
import { getRepository } from 'typeorm';
import { Timesheet, TimesheetStatus } from '../models/timesheet';
import User from '../models/user';
import { AppDataSource } from '../server/database';
import { AuditLogService } from './auditLogService';

export class TimesheetService {
  private timesheetRepository = AppDataSource.getRepository(Timesheet);
  private userRepository = AppDataSource.getRepository(User);
  private auditLogService = new AuditLogService();

  public async getUserTimesheets(userId: string): Promise<Timesheet[]> {
    return this.timesheetRepository.find({ where: { user: { id: userId } } });
  }

  public async getTimesheetById(id: string): Promise<Timesheet | null> {
    return this.timesheetRepository.findOne({ where: { id } });
  }

  public async createTimesheet(userId: string, startDate: Date, endDate: Date): Promise<Timesheet> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const timesheet = new Timesheet();
    timesheet.user = user;
    timesheet.startDate = startDate;
    timesheet.endDate = endDate;

    const newTimesheet = await this.timesheetRepository.save(timesheet);

    await this.auditLogService.logEvent(userId, 'CREATE', 'Timesheet', newTimesheet.id, newTimesheet);

    return newTimesheet;
  }

  public async updateTimesheetStatus(id: string, status: TimesheetStatus): Promise<Timesheet | null> {
    const timesheet = await this.timesheetRepository.findOne({ where: { id }, relations: ['user'] });
    if (timesheet) {
      const oldStatus = timesheet.status;
      timesheet.status = status;
      const updatedTimesheet = await this.timesheetRepository.save(timesheet);

      await this.auditLogService.logEvent(timesheet.user.id, 'UPDATE_STATUS', 'Timesheet', updatedTimesheet.id, { oldStatus, newStatus: status });

      return updatedTimesheet;
    }
    return null;
  }
}
