
import { AppDataSource } from '../server/database';
import { TimesheetEntry } from '../models/timesheetEntry';
import { ActionCode } from '../models/actionCode';
import { Between } from 'typeorm';
import User from '../models/user';
import { Approval, ApprovalStatus } from '../models/approval';

import { TimesheetEntryDto, TimesheetHistorySummary } from '../dto/TimesheetDto';

interface TimesheetContext {
  userId: string;
  orgId: string;
}

export class TimesheetService {
  private timesheetEntryRepository = AppDataSource.getRepository(TimesheetEntry);
  private userRepository = AppDataSource.getRepository(User);
  private actionCodeRepository = AppDataSource.getRepository(ActionCode);

  public async listByWeek({ userId, orgId, weekStart, page = 1, limit = 10 }: { userId: string; orgId: string; weekStart: Date; page?: number; limit?: number }): Promise<{ data: TimesheetEntry[]; total: number; page: number; lastPage: number }> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const [data, total] = await this.timesheetEntryRepository.findAndCount({
      where: {
        user: { id: userId },
        organization: { id: orgId },
        day: Between(weekStart, weekEnd),
      },
      take: limit,
      skip: (page - 1) * limit,
      order: { day: 'ASC', startedAt: 'ASC' },
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
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

  public async approve(id: string, approverId: string, orgId: string): Promise<Approval | null> {
    const timesheetEntry = await this.timesheetEntryRepository.findOne({ where: { id, organization: { id: orgId } } });
    if (!timesheetEntry) {
      throw new Error('Timesheet entry not found or does not belong to your organization');
    }

    const approval = new Approval();
    approval.entryId = id;
    approval.approverId = approverId;
    approval.status = ApprovalStatus.APPROVED;

    return AppDataSource.getRepository(Approval).save(approval);
  }

  public async reject(id: string, approverId: string, orgId: string, reason?: string): Promise<Approval | null> {
    const timesheetEntry = await this.timesheetEntryRepository.findOne({ where: { id, organization: { id: orgId } } });
    if (!timesheetEntry) {
      throw new Error('Timesheet entry not found or does not belong to your organization');
    }

    const approval = new Approval();
    approval.entryId = id;
    approval.approverId = approverId;
    approval.status = ApprovalStatus.REJECTED;
    approval.reason = reason;

    return AppDataSource.getRepository(Approval).save(approval);
  }

  public async listHistory({ userId, orgId }: { userId: string; orgId: string }): Promise<TimesheetHistorySummary[]> {
    // This is a simplified implementation. In a real application, you might have a dedicated
    // TimesheetWeek entity or a more complex aggregation logic.
    const timesheetEntries = await this.timesheetEntryRepository.find({
      where: {
        user: { id: userId },
        organization: { id: orgId },
      },
      order: { day: 'DESC' },
    });

    const weeksMap = new Map<string, TimesheetHistorySummary>();

    for (const entry of timesheetEntries) {
      const weekStart = new Date(entry.day);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Get Sunday of the week
      const weekStartISO = weekStart.toISOString().split('T')[0];

      if (!weeksMap.has(weekStartISO)) {
        weeksMap.set(weekStartISO, {
          weekStartISO,
          status: 'pending', // Default status
          weekTotal: 0,
          submittedAt: undefined,
        });
      }

      const weekSummary = weeksMap.get(weekStartISO)!;
      weekSummary.weekTotal += entry.durationMin;
      // More complex logic would be needed to determine actual status and submittedAt
    }

    return Array.from(weeksMap.values());
  }
}
