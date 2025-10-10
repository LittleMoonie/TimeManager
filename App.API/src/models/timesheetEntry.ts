
import { Column, Entity, ManyToOne, OneToMany, Check, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import User from './user';
import { Organization } from './organization';
import { ActionCode } from './actionCode';
import { Approval } from './approval';

export enum WorkMode {
  OFFICE = 'office',
  REMOTE = 'remote',
  HYBRID = 'hybrid',
}

@Entity()
@Check(`"durationMin" <= 1440`)
@Index(['orgId', 'userId', 'day'])
export class TimesheetEntry extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  orgId!: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  organization!: Organization;

  @ManyToOne(() => ActionCode)
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
  @Check(`"durationMin" >= 0`)
  durationMin!: number;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ type: 'date' })
  day!: Date;

  // TODO: Add exclusion constraint for overlapping intervals for same userId/day when startedAt/endedAt not null

  @OneToMany(() => Approval, (approval) => approval.entry)
  approvals!: Approval[];
}
