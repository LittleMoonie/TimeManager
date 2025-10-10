
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { TimesheetEntry } from './timesheetEntry';
import User from './user';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class Approval extends BaseEntity {
  @ManyToOne(() => TimesheetEntry, (entry) => entry.approvals)
  entry!: TimesheetEntry;

  @ManyToOne(() => User)
  approver!: User;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  status!: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  reason?: string;
}
