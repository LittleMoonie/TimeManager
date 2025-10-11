import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { FindOperator, Like, Repository } from 'typeorm';
import { ActionCode } from '../../Entity/Timesheets/ActionCode';
import { TimesheetHistoryService } from './TimesheetHistoryService';
import { Organization } from '../../Entity/Company/Company';
import { TimesheetHistoryEntityTypeEnum } from '../../Entity/Enums/TimesheetHistory/TimesheetHistoryEntityTypeEnum';
import { TimesheetHistoryActionEnum } from '../../Entity/Enums/TimesheetHistory/TimesheetHistoryActionEnum';

interface ActionCodeSearchQuery {
  orgId: string;
  q?: string;
}

interface ActionCodeContext {
  orgId: string;
  actorUserId: string;
}

@Service()
export class ActionCodeService {
  constructor(
    @InjectRepository(ActionCode)
    private actionCodeRepository: Repository<ActionCode>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private timesheetHistoryService: TimesheetHistoryService,
  ) {}

  public async search({ orgId, q }: ActionCodeSearchQuery): Promise<ActionCode[]> {
    const where: {
      organization: { id: string };
      name?: FindOperator<string>;
    } = { organization: { id: orgId } };

    if (q) {
      where.name = Like(`%${q}%`);
    }

    return this.actionCodeRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  public async create(name: string, code: string, ctx: ActionCodeContext): Promise<ActionCode> {
    const organization = await this.organizationRepository.findOne({ where: { id: ctx.orgId } });
    if (!organization) {
      throw new Error('Organization not found');
    }

    const newActionCode = this.actionCodeRepository.create({
      name,
      code,
      organization,
    });

    const savedActionCode = await this.actionCodeRepository.save(newActionCode);

    await this.timesheetHistoryService.recordEvent({
      userId: ctx.actorUserId,
      entityType: TimesheetHistoryEntityTypeEnum.Approval,
      entityId: savedActionCode.id,
      action: TimesheetHistoryActionEnum.created,
      actorUserId: ctx.actorUserId,
      metadata: { source: 'api' },
    }, { orgId: ctx.orgId });

    return savedActionCode;
  }

  public async update(id: string, name: string, code: string, ctx: ActionCodeContext): Promise<ActionCode | null> {
    const actionCode = await this.actionCodeRepository.findOne({ where: { id, organization: { id: ctx.orgId } } });
    if (!actionCode) {
      return null;
    }

    const oldActionCode = { ...actionCode };
    actionCode.name = name;
    actionCode.code = code;

    const savedActionCode = await this.actionCodeRepository.save(actionCode);

    await this.timesheetHistoryService.recordEvent({
      userId: ctx.actorUserId,
      entityType: TimesheetHistoryEntityTypeEnum.Approval,
      entityId: savedActionCode.id,
      action: TimesheetHistoryActionEnum.updated,
      actorUserId: ctx.actorUserId,
      diff: { before: oldActionCode, after: savedActionCode },
      metadata: { source: 'api' },
    }, { orgId: ctx.orgId });

    return savedActionCode;
  }

  public async delete(id: string, ctx: ActionCodeContext): Promise<void> {
    const actionCode = await this.actionCodeRepository.findOne({ where: { id, organization: { id: ctx.orgId } } });
    if (!actionCode) {
      throw new Error('Action code not found or does not belong to the organization');
    }

    await this.actionCodeRepository.remove(actionCode);

    await this.timesheetHistoryService.recordEvent({
      userId: ctx.actorUserId,
      entityType: TimesheetHistoryEntityTypeEnum.Approval,
      entityId: id,
      action: TimesheetHistoryActionEnum.deleted,
      actorUserId: ctx.actorUserId,
      metadata: { source: 'api' },
    }, { orgId: ctx.orgId });
  }
}
