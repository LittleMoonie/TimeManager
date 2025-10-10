
import { Column, Entity, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { TimesheetEntry } from './timesheetEntry';
import User from './user';
import { Organization } from './organization';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
@Index(['orgId', 'entryId'])
@Index(['orgId', 'approverId'])
export class Approval extends BaseEntity {
  @Column({ type: 'uuid' })
  orgId!: string;

  @ManyToOne(() => Organization, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'orgId' })
  organization!: Organization;

  @Column({ type: 'uuid' })
  entryId!: string;

  @ManyToOne(() => TimesheetEntry, (entry) => entry.approvals, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'entryId' })
  entry!: TimesheetEntry;

  @Column({ type: 'uuid' })
  approverId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'approverId' })
  approver!: User;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  status!: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  reason?: string;
}
