
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import User from './user';

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

@Entity()
export class LeaveRequest extends BaseEntity {
  @ManyToOne(() => User)
  user!: User;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @Column({
    type: 'enum',
    enum: LeaveType,
  })
  leaveType!: LeaveType;

  @Column({
    type: 'enum',
    enum: LeaveRequestStatus,
    default: LeaveRequestStatus.PENDING,
  })
  status!: LeaveRequestStatus;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;
}
