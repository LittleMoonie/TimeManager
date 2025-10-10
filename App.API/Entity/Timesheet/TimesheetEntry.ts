
import { Column, Entity, ManyToOne, OneToMany, Check, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import User from '../Users/User';
import { Organization } from '../Company/Company';
import { ActionCode } from './ActionCode';
import { Approval } from '../Company/Approval';

export enum WorkMode {
  OFFICE = 'office',
  REMOTE = 'remote',
  HYBRID = 'hybrid',
}

@Entity()
@Check(`"durationMin" BETWEEN 0 AND 1440`)
@Index(['orgId', 'userId', 'day'])
export class TimesheetEntry extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  orgId!: string;

  @ManyToOne(() => Organization, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'orgId' })
  organization!: Organization;

  @Column({ type: 'uuid' })
  actionCodeId!: string;

  @ManyToOne(() => ActionCode, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'actionCodeId' })
  actionCode!: ActionCode;

  @Column({ type: 'enum', enum: WorkMode, default: WorkMode.OFFICE })
  workMode!: WorkMode;

  @Column({ type: 'varchar', length: 2 })
  country!: string;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt?: Date;

  @Column({ type: 'int' })
  durationMin!: number;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ type: 'date' })
  day!: Date;

  // TODO: Add exclusion constraint for overlapping intervals for same userId/day when startedAt/endedAt not null

  @OneToMany(() => Approval, (approval) => approval.entry)
  approvals!: Approval[];
}
