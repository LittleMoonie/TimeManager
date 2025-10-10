
import { Column, Entity, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { TimesheetEntry } from './timesheetEntry';
import User from './user';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
@Index(['entryId'])
export class Approval extends BaseEntity {
  @Column({ type: 'uuid' })
  entryId!: string;

  @ManyToOne(() => TimesheetEntry, (entry) => entry.approvals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entryId' })
  entry!: TimesheetEntry;

  @Column({ type: 'uuid' })
  approverId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'approverId' })
  approver!: User;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  status!: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  reason?: string;
}
