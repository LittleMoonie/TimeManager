import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import { Company } from '../Company/Company';
import User from '../Users/User';
import { TimesheetEntry } from './TimesheetEntry';

export enum TimesheetStatus { DRAFT='DRAFT', SUBMITTED='SUBMITTED', APPROVED='APPROVED', REJECTED='REJECTED' }

@Entity('timesheets')
@Index(['companyId', 'userId', 'periodStart', 'periodEnd'], { unique: true })
@Index(['companyId', 'status'])
export class Timesheet extends BaseEntity {
  @Column('uuid') companyId!: string;
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'companyId' }) company!: Company;

  @Column('uuid') userId!: string;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'userId' }) user!: User;

  @Column({ type: 'date' }) periodStart!: string; // ISO date
  @Column({ type: 'date' }) periodEnd!:   string;

  @Column({ type: 'varchar', length: 16, default: TimesheetStatus.DRAFT })
  status!: TimesheetStatus;

  @Column({ type: 'timestamp with time zone', nullable: true }) submittedAt?: Date;
  @Column({ type: 'uuid', nullable: true }) submittedByUserId?: string;

  @Column({ type: 'timestamp with time zone', nullable: true }) approvedAt?: Date;
  @Column({ type: 'uuid', nullable: true }) approverId?: string;

  @Column({ type: 'int', default: 0 }) totalMinutes!: number; // roll-up cache
  @Column({ type: 'text', nullable: true }) notes?: string;

  @OneToMany(() => TimesheetEntry, (e) => e.timesheet)
  entries!: TimesheetEntry[];
}
