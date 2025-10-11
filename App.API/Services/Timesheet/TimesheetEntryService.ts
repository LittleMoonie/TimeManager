import { Service } from "typedi";
import { TimesheetEntryRepository } from "../../Repositories/Timesheets/TimesheetEntryRepository";
import { TimesheetEntry } from "../../Entities/Timesheets/TimesheetEntry";
import { NotFoundError } from "../../Errors/HttpErrors";
import {
  CreateTimesheetEntryDto,
  UpdateTimesheetEntryDto,
} from "../../Dtos/Timesheet/TimesheetDto";

@Service()
export class TimesheetEntryService {
  constructor(private timesheetEntryRepository: TimesheetEntryRepository) {}

  public async createTimesheetEntry(
    companyId: string,
    userId: string,
    createTimesheetEntryDto: CreateTimesheetEntryDto,
  ): Promise<TimesheetEntry> {
    return this.timesheetEntryRepository.create({
      companyId,
      userId,
      ...createTimesheetEntryDto,
    });
  }

  public async getTimesheetEntryById(id: string): Promise<TimesheetEntry> {
    const entry = await this.timesheetEntryRepository.findById(id);
    if (!entry) {
      throw new NotFoundError("Timesheet entry not found");
    }
    return entry;
  }

  public async updateTimesheetEntry(
    id: string,
    updateTimesheetEntryDto: UpdateTimesheetEntryDto,
  ): Promise<TimesheetEntry> {
    await this.getTimesheetEntryById(id);
    const updatedEntry = await this.timesheetEntryRepository.update(
      id,
      updateTimesheetEntryDto,
    );
    return updatedEntry!;
  }

  public async deleteTimesheetEntry(id: string): Promise<void> {
    await this.getTimesheetEntryById(id);
    await this.timesheetEntryRepository.delete(id);
  }
}
