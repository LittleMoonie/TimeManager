import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '../BaseEntity';
import { Company } from '../Companies/Company';
import User from '../Users/User';

import { TimesheetEntry } from './TimesheetEntry';
import { TimesheetRow } from './TimesheetRow';

/**
 * @description Defines the possible statuses for a timesheet.
 */
export enum TimesheetStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/**
 * @description Represents a timesheet submitted by a user for a specific period.
 */
@Entity('timesheets')
@Index(['companyId', 'userId', 'periodStart', 'periodEnd'], { unique: true })
@Index(['companyId', 'status'])
export class Timesheet extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this timesheet belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column('uuid') companyId!: string;
  /**
   * @description The company associated with this timesheet.
   */
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The unique identifier of the user who owns this timesheet.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column('uuid') userId!: string;
  /**
   * @description The user who owns this timesheet.
   */
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  /**
   * @description The start date of the timesheet period in ISO date format (YYYY-MM-DD).
   * @example "2024-01-01"
   */
  @Column({ type: 'date' }) periodStart!: string; // ISO date
  /**
   * @description The end date of the timesheet period in ISO date format (YYYY-MM-DD).
   * @example "2024-01-07"
   */
  @Column({ type: 'date' }) periodEnd!: string;

  /**
   * @description The current status of the timesheet.
   * @example "DRAFT"
   */
  @Column({ type: 'varchar', length: 16, default: TimesheetStatus.DRAFT })
  status!: TimesheetStatus;

  /**
   * @description Optional: Timestamp when the timesheet was submitted for approval.
   * @example "2024-01-08T10:00:00Z"
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  submittedAt?: Date;
  /**
   * @description Optional: The unique identifier of the user who submitted the timesheet.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid', nullable: true }) submittedByUserId?: string;

  /**
   * @description Optional: Timestamp when the timesheet was approved.
   * @example "2024-01-09T11:00:00Z"
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt?: Date;
  /**
   * @description Optional: The unique identifier of the user who approved the timesheet.
   * @example "a1p2p3r4-o5v6e7r8-9012-3456-7890abcdef"
   */
  @Column({ type: 'uuid', nullable: true }) approverId?: string;

  /**
   * @description The total duration in minutes of all entries in this timesheet.
   * This is a cached value for quick retrieval.
   * @example 480
   */
  @Column({ type: 'int', default: 0 }) totalMinutes!: number; // roll-up cache
  /**
   * @description Optional: Any general notes or comments for the timesheet.
   * @example "Weekly report for Project Alpha"
   */
  @Column({ type: 'text', nullable: true }) notes?: string;

  /**
   * @description List of individual timesheet entries belonging to this timesheet.
   */
  @OneToMany(() => TimesheetEntry, (e) => e.timesheet)
  entries!: TimesheetEntry[];

  /**
   * @description Structured rows grouped by project or non-project activity.
   */
  @OneToMany(() => TimesheetRow, (row) => row.timesheet)
  rows!: TimesheetRow[];
}
