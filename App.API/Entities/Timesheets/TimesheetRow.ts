import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '../BaseEntity';
import { Company } from '../Companies/Company';
import User from '../Users/User';

import { ActionCode } from './ActionCode';
import { Timesheet } from './Timesheet';
import { TimesheetEntry } from './TimesheetEntry';

export enum TimesheetRowStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum TimesheetRowBillableTag {
  BILLABLE = 'billable',
  NON_BILLABLE = 'non-billable',
  AUTO = 'auto',
}

export enum TimesheetRowLocation {
  OFFICE = 'Office',
  HOMEWORKING = 'Homeworking',
  HYBRID = 'Hybrid',
}

@Entity('timesheet_rows')
@Index(['companyId', 'timesheetId'])
@Index(['userId', 'timesheetId'])
export class TimesheetRow extends BaseEntity {
  @Column('uuid')
  companyId!: string;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column('uuid')
  timesheetId!: string;

  @ManyToOne(() => Timesheet, (timesheet) => timesheet.rows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timesheetId' })
  timesheet!: Timesheet;

  @Column({ type: 'varchar', length: 255 })
  activityLabel!: string;

  @Column('uuid')
  timeCodeId!: string;

  @ManyToOne(() => ActionCode, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'timeCodeId' })
  timeCode!: ActionCode;

  @Column({ type: 'varchar', length: 24, default: TimesheetRowBillableTag.AUTO })
  billable!: TimesheetRowBillableTag;

  @Column({ type: 'varchar', length: 32, default: TimesheetRowLocation.OFFICE })
  location!: TimesheetRowLocation;

  @Column({ type: 'varchar', length: 2, nullable: true })
  employeeCountryCode?: string;

  @Column({ type: 'varchar', length: 2 })
  countryCode!: string;

  @Column({ type: 'varchar', length: 24, default: TimesheetRowStatus.DRAFT })
  status!: TimesheetRowStatus;

  @Column({ type: 'boolean', default: false })
  locked!: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @OneToMany(() => TimesheetEntry, (entry) => entry.timesheetRow)
  entries!: TimesheetEntry[];
}
