import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import User from '../Users/User';
import { Company } from './Company';

/**
 * @description Defines the possible statuses for a leave request.
 */
export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

/**
 * @description Defines the possible types of leave.
 */
export enum LeaveType {
  PTO = 'PTO',
  SICK = 'SICK',
  UNPAID = 'UNPAID',
}

/**
 * @description Represents a leave request made by a user within a company.
 */
@Entity('leave_requests')
@Index(['companyId', 'userId'])
@Index(['companyId', 'startDate', 'endDate'])
export class LeaveRequest extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this leave request belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid' }) companyId!: string;

  /**
   * @description The company associated with this leave request.
   */
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The unique identifier of the user who made this leave request.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid' }) userId!: string;

  /**
   * @description The user who made this leave request.
   */
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  /**
   * @description The start date of the leave request.
   * @example "2024-01-01"
   */
  @Column({ type: 'date' }) startDate!: Date;
  /**
   * @description The end date of the leave request.
   * @example "2024-01-05"
   */
  @Column({ type: 'date' }) endDate!: Date;

  /**
   * @description The type of leave being requested.
   * @example "PTO"
   */
  @Column({ type: 'varchar', length: 20 }) leaveType!: LeaveType;

  /**
   * @description The current status of the leave request.
   * @example "PENDING"
   */
  @Column({ type: 'varchar', length: 20, default: LeaveRequestStatus.PENDING })
  status!: LeaveRequestStatus;

  /**
   * @description Optional: A reason or description for the leave request.
   * @example "Annual vacation trip"
   */
  @Column({ type: 'text', nullable: true }) reason?: string;
  /**
   * @description Optional: A reason for rejecting the leave request.
   * @example "Insufficient coverage"
   */
  @Column({ type: 'text', nullable: true }) rejectionReason?: string;
}
