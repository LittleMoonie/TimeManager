import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Organization } from './organization';
import User from './user';
import { TimesheetHistoryEntityTypeEnum } from './enums/timesheetHistory/TimesheetHistoryEntityTypeEnum';
import { TimesheetHistoryActionEnum } from './enums/timesheetHistory/TimesheetHistoryActionEnum';

export enum TimesheetStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('timesheet_history')
@Index(['orgId', 'userId', 'weekStart'])
export class TimesheetHistory extends BaseEntity {
  @Column({ type: 'uuid' })
  orgId!: string;

  @ManyToOne(() => Organization, (org) => org.timesheetHistory, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'orgId' })
  organization!: Organization;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'enum', enum: TimesheetHistoryEntityTypeEnum })
  entityType!: TimesheetHistoryEntityTypeEnum;

  @Column({ type: 'uuid' })
  entityId!: string;

  @Column({ type: 'enum', enum: TimesheetHistoryActionEnum })
  action!: TimesheetHistoryActionEnum;

  @Column({ type: 'uuid', nullable: true })
  actorUserId?: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'actorUserId' })
  actorUser?: User;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'jsonb', nullable: true })
  diff?: object;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: object;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  occurredAt!: Date;

  @Column({ type: 'date' })
  weekStart!: string;

  @Column({ type: 'date' })
  weekEnd!: string;

  @Column({ type: 'numeric', precision: 6, scale: 2, default: 0 })
  totalHours!: string;

  @Column({ type: 'varchar', length: 2 })
  country!: string;

  @Column({ type: 'varchar', length: 32 })
  location!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'enum', enum: TimesheetStatus, default: TimesheetStatus.DRAFT })
  status!: TimesheetStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hash?: string;
}
