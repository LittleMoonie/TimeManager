
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Between, Repository } from 'typeorm';
import { TimesheetEntry } from '../../Entity/Timesheets/TimesheetEntry';
import { ActionCode } from '../../Entity/Timesheets/ActionCode';
import User from '../../Entity/Users/User';
import { Approval, ApprovalStatus } from '../../Entity/Company/Approval';
import { TimesheetHistoryService } from './TimesheetHistoryService';
import { TimesheetEntryDto, TimesheetHistorySummary } from '../../Dto/Timesheet/TimesheetDto';
import { TimesheetHistoryEntityTypeEnum } from '../../Entity/Enums/TimesheetHistory/TimesheetHistoryEntityTypeEnum';
import { TimesheetHistoryActionEnum } from '../../Entity/Enums/TimesheetHistory/TimesheetHistoryActionEnum';

interface TimesheetContext {
  userId: string;
  orgId: string;
  actorUserId: string;
}

@Service()
export class TimesheetService {
  constructor(
    @InjectRepository(TimesheetEntry)
    private timesheetEntryRepository: Repository<TimesheetEntry>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ActionCode)
    private actionCodeRepository: Repository<ActionCode>,
    @InjectRepository(Approval)
    private approvalRepository: Repository<Approval>,
    private timesheetHistoryService: TimesheetHistoryService,
  ) {}

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

    const savedEntry = await this.timesheetEntryRepository.save(newEntry);

    await this.timesheetHistoryService.recordEvent({
      entityType: TimesheetHistoryEntityTypeEnum.TimesheetEntry,
      entityId: savedEntry.id,
      action: TimesheetHistoryActionEnum.created,
      userId: ctx.userId,
      actorUserId: ctx.actorUserId,
      metadata: { source: 'api' },
    }, { orgId: ctx.orgId });

    return savedEntry;
  }

  public async update(id: string, entryDto: Partial<TimesheetEntryDto>, ctx: TimesheetContext): Promise<TimesheetEntry | null> {
    const entry = await this.timesheetEntryRepository.findOne({ where: { id, user: { id: ctx.userId } } });
    if (!entry) {
      return null;
    }

    const oldEntry = { ...entry }; // Capture old state for diff
    Object.assign(entry, entryDto);

    const savedEntry = await this.timesheetEntryRepository.save(entry);

    // TODO: Implement a proper diffing mechanism
    await this.timesheetHistoryService.recordEvent({
      entityType: TimesheetHistoryEntityTypeEnum.TimesheetEntry,
      entityId: savedEntry.id,
      action: TimesheetHistoryActionEnum.updated,
      userId: ctx.userId,
      actorUserId: ctx.actorUserId,
      diff: { before: oldEntry, after: savedEntry }, // Placeholder diff
      metadata: { source: 'api' },
    }, { orgId: ctx.orgId });

    return savedEntry;
  }

  public async delete(id: string, ctx: TimesheetContext): Promise<void> {
    const entry = await this.timesheetEntryRepository.findOne({ where: { id, user: { id: ctx.userId } } });
    if (!entry) {
      throw new Error('Entry not found or you do not have permission to delete it');
    }

    await this.timesheetEntryRepository.remove(entry);

    await this.timesheetHistoryService.recordEvent({
      entityType: TimesheetHistoryEntityTypeEnum.TimesheetEntry,
      entityId: id,
      action: TimesheetHistoryActionEnum.deleted,
      userId: ctx.userId,
      actorUserId: ctx.actorUserId,
      metadata: { source: 'api' },
    }, { orgId: ctx.orgId });
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

    const savedApproval = await this.approvalRepository.save(approval);

    await this.timesheetHistoryService.recordEvent({
      entityType: TimesheetHistoryEntityTypeEnum.Approval,
      entityId: savedApproval.id,
      action: TimesheetHistoryActionEnum.approved,
      userId: timesheetEntry.user.id,
      actorUserId: approverId,
      metadata: { source: 'api' },
    }, { orgId: orgId });

    return savedApproval;
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

    const savedApproval = await this.approvalRepository.save(approval);

    await this.timesheetHistoryService.recordEvent({
      entityType: TimesheetHistoryEntityTypeEnum.Approval,
      entityId: savedApproval.id,
      action: TimesheetHistoryActionEnum.rejected,
      userId: timesheetEntry.user.id,
      actorUserId: approverId,
      reason: reason,
      metadata: { source: 'api' },
    }, { orgId: orgId });

    return savedApproval;
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
