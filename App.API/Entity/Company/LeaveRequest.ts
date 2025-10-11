import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import User from '../Users/User';
import { Company } from './Company';

export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum LeaveType {
  PTO = 'PTO',
  SICK = 'SICK',
  UNPAID = 'UNPAID',
}

@Entity('leave_requests')
@Index(['companyId', 'userId'])
@Index(['companyId', 'startDate', 'endDate'])
export class LeaveRequest extends BaseEntity {
  @Column({ type: 'uuid' }) companyId!: string;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column({ type: 'uuid' }) userId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'date' }) startDate!: Date;
  @Column({ type: 'date' }) endDate!: Date;

  @Column({ type: 'varchar', length: 20 }) leaveType!: LeaveType;

  @Column({ type: 'varchar', length: 20, default: LeaveRequestStatus.PENDING })
  status!: LeaveRequestStatus;

  @Column({ type: 'text', nullable: true }) reason?: string;
  @Column({ type: 'text', nullable: true }) rejectionReason?: string;
}
