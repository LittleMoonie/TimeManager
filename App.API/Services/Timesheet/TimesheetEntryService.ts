import { Service } from "typedi";
import { TimesheetEntryRepository } from "../../Repositories/Timesheets/TimesheetEntryRepository";
import { TimesheetEntry } from "../../Entities/Timesheets/TimesheetEntry";
import { NotFoundError } from "../../Errors/HttpErrors";
import { CreateTimesheetEntryDto, UpdateTimesheetEntryDto } from "../../Dtos/Timesheet/TimesheetDto";

@Service()
export class TimesheetEntryService {
  constructor(private readonly timesheetEntryRepository: TimesheetEntryRepository) {}

  public async createTimesheetEntry(
    companyId: string,
    userId: string,
    dto: CreateTimesheetEntryDto,
  ): Promise<TimesheetEntry> {
    return this.timesheetEntryRepository.create({ companyId, userId, ...dto });
    }

  public async getTimesheetEntryById(id: string): Promise<TimesheetEntry> {
    const entry = await this.timesheetEntryRepository.findById(id);
    if (!entry) throw new NotFoundError("Timesheet entry not found");
    return entry;
  }

  public async updateTimesheetEntry(id: string, dto: UpdateTimesheetEntryDto): Promise<TimesheetEntry> {
    await this.getTimesheetEntryById(id);
    const updated = await this.timesheetEntryRepository.update(id, dto);
    return updated!;
  }

  public async deleteTimesheetEntry(id: string): Promise<void> {
    await this.getTimesheetEntryById(id);
    await this.timesheetEntryRepository.delete(id);
  }
}
