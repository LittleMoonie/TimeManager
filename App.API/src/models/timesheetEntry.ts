
import { Column, Entity, ManyToOne, OneToMany, Check } from 'typeorm';
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
export class TimesheetEntry extends BaseEntity {
  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Organization)
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
  durationMin!: number;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ type: 'date' })
  day!: Date;

  @OneToMany(() => Approval, (approval) => approval.entry)
  approvals!: Approval[];
}
