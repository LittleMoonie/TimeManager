
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import User from './user';

export enum TimesheetStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPORTED = 'EXPORTED',
  REOPENED = 'REOPENED',
}

@Entity()
export class Timesheet extends BaseEntity {
  @ManyToOne(() => User)
  user!: User;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @Column({
    type: 'enum',
    enum: TimesheetStatus,
    default: TimesheetStatus.DRAFT,
  })
  status!: TimesheetStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;
}
