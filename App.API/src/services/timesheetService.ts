
import { AppDataSource } from '../server/database';
import { TimesheetEntry } from '../models/timesheetEntry';
import { ActionCode } from '../models/actionCode';
import { Between } from 'typeorm';
import User from '../models/user';

interface TimesheetEntryDto {
  actionCodeId: string;
  workMode: 'office' | 'remote' | 'hybrid';
  country: string;
  startedAt?: Date;
  endedAt?: Date;
  durationMin: number;
  note?: string;
  day: Date;
}

interface TimesheetContext {
  userId: string;
  orgId: string;
}

export class TimesheetService {
  private timesheetEntryRepository = AppDataSource.getRepository(TimesheetEntry);
  private userRepository = AppDataSource.getRepository(User);
  private actionCodeRepository = AppDataSource.getRepository(ActionCode);

  public async listByWeek({ userId, orgId, weekStart }: { userId: string; orgId: string; weekStart: Date }): Promise<TimesheetEntry[]> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return this.timesheetEntryRepository.find({
      where: {
        user: { id: userId },
        organization: { id: orgId },
        day: Between(weekStart, weekEnd),
      },
    });
  }

  public async create(entryDto: TimesheetEntryDto, ctx: TimesheetContext): Promise<TimesheetEntry> {
    const user = await this.userRepository.findOne({ where: { id: ctx.userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const actionCode = await this.actionCodeRepository.findOne({ where: { id: entryDto.actionCodeId, organization: { id: ctx.orgId } } });
    if (!actionCode) {
      throw new Error('Action code not found or does not belong to the organization');
    }

    const newEntry = new TimesheetEntry();
    Object.assign(newEntry, entryDto);
    newEntry.user = user;
    newEntry.organization = user.organization;

    return this.timesheetEntryRepository.save(newEntry);
  }

  public async update(id: string, entryDto: Partial<TimesheetEntryDto>, ctx: TimesheetContext): Promise<TimesheetEntry | null> {
    const entry = await this.timesheetEntryRepository.findOne({ where: { id, user: { id: ctx.userId } } });
    if (!entry) {
      return null;
    }

    Object.assign(entry, entryDto);

    return this.timesheetEntryRepository.save(entry);
  }

  public async delete(id: string, ctx: TimesheetContext): Promise<void> {
    const entry = await this.timesheetEntryRepository.findOne({ where: { id, user: { id: ctx.userId } } });
    if (!entry) {
      throw new Error('Entry not found or you do not have permission to delete it');
    }

    await this.timesheetEntryRepository.remove(entry);
  }
}
