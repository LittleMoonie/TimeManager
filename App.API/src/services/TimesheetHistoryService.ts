import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';
import { TimesheetHistory } from '../models/timesheetHistory';
import { RecordHistoryDto } from '../dto/timesheetHistory/RecordHistoryDto';
import { createHash } from 'crypto';
import User from '../models/user';
import { Organization } from '../models/organization';
import { TimesheetHistoryDto } from '../dto/timesheetHistory/TimesheetHistoryDto';
import { TimesheetHistoryActionEnum } from '../models/enums/timesheetHistory/TimesheetHistoryActionEnum';
import { TimesheetHistoryEntityTypeEnum } from '../models/enums/timesheetHistory/TimesheetHistoryEntityTypeEnum';

@Service()
export class TimesheetHistoryService {
  constructor(
    @InjectRepository(TimesheetHistory)
    private timesheetHistoryRepository: Repository<TimesheetHistory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  private calculateHash(orgId: string, dto: RecordHistoryDto): string {
    const payload = { orgId, ...dto };
    // Ensure a stable stringification for consistent hashing
    const normalizedPayload = JSON.stringify(payload, Object.keys(payload).sort());
    return createHash('sha256').update(normalizedPayload).digest('hex');
  }

  public async recordEvent(
    dto: RecordHistoryDto,
    ctx: { orgId: string },
  ): Promise<TimesheetHistory> {
    if (!dto.hash) {
      dto.hash = this.calculateHash(ctx.orgId, dto);
    }

    const existingEvent = await this.timesheetHistoryRepository.findOne({ where : { hash: dto.hash as string } });
    if (existingEvent) {
      return existingEvent;
    }

    const timesheetHistory = this.timesheetHistoryRepository.create({
      ...dto,
      organization: { id: ctx.orgId },
      createdAt: new Date(),
    });
    return this.timesheetHistoryRepository.save(timesheetHistory) as Promise<TimesheetHistory>  as unknown as Promise<TimesheetHistory>;
  }

  public async list(
    query: TimesheetHistoryDto,
    ctx: { orgId: string; userId: string; roles: string[] },
  ): Promise<{ data: TimesheetHistory[]; nextCursor?: string }> {
    const isManagerOrAdmin = ctx.roles.includes('manager') || ctx.roles.includes('admin');

    let qb = this.timesheetHistoryRepository.createQueryBuilder('history')
      .leftJoinAndSelect('history.user', 'user')
      .leftJoinAndSelect('history.actorUser', 'actorUser')
      .where('history.organization = :orgId', { orgId: ctx.orgId });

    if (!isManagerOrAdmin) {
      qb = qb.andWhere('history.userId = :userId', { userId: ctx.userId });
    } else if (query.userId) {
      qb = qb.andWhere('history.userId = :queryUserId', { queryUserId: query.userId });
    }

    if (query.entityType) {
      qb = qb.andWhere('history.entityType = :entityType', { entityType: query.entityType });
    }
    if (query.entityId) {
      qb = qb.andWhere('history.entityId = :entityId', { entityId: query.entityId });
    }
    if (query.action && query.action.length > 0) {
      qb = qb.andWhere('history.action IN (:...action)', { action: query.action });
    }
    if (query.startedAt) {
      qb = qb.andWhere('history.createdAt >= :from', { from: query.startedAt });
    }
    if (query.endedAt) {
      qb = qb.andWhere('history.createdAt <= :to', { to: query.endedAt });
    }

    qb = qb.orderBy('history.createdAt', 'DESC')
      .addOrderBy('history.id', 'DESC');

    const limit = query.limit && query.limit > 0 ? query.limit : 50;
    qb = qb.take(limit + 1); // Fetch one extra for cursor

    const history = await qb.getMany();

    let nextCursor: string | undefined;
    if (history.length > limit) {
      const lastItem = history.pop();
      nextCursor = Buffer.from(`${lastItem?.createdAt.toISOString()}_${lastItem?.id}`).toString('base64');
    }

    return { data: history, nextCursor };
  }

  public async forEntity(
    entityType: TimesheetHistoryEntityTypeEnum,
    entityId: string,
    ctx: { orgId: string; userId: string; roles: string[] },
  ): Promise<{ data: TimesheetHistory[]; nextCursor?: string }> {
    const query: TimesheetHistoryDto = { 
      entityType, 
      entityId, 
      userId: ctx.userId,
      action: TimesheetHistoryActionEnum.created,
    };
    return this.list(query, ctx);
  }
}