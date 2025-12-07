import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';

import { BaseEntity } from '../BaseEntity';
import { Company } from '../Companies/Company';

/**
 * @description Interface for a string-to-string dictionary, used for metadata and diffs.
 */
export interface IStringToStringDictionary {
  [key: string]: string;
}

/**
 * @description Records historical events related to timesheet entities.
 */
@Entity('timesheet_history')
@Index(['companyId', 'userId'])
@Index(['companyId', 'targetType', 'targetId'])
export class TimesheetHistory extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this history record belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column('uuid') companyId!: string;

  /**
   * @description The company associated with this history record.
   */
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The unique identifier of the user associated with the timesheet entity that this history record pertains to.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column('uuid') userId!: string; // owner of timesheet/entry

  /**
   * @description The type of the target entity that the history record refers to.
   * @example "Timesheet"
   */
  @Column({ type: 'varchar', length: 32 }) targetType!:
    | 'Timesheet'
    | 'TimesheetEntry'
    | 'TimesheetApproval'
    | 'ActionCode';

  /**
   * @description The unique identifier of the target entity.
   * @example "t1i2m3e4-s5h6e7e8-9012-3456-7890abcdef"
   */
  @Column('uuid') targetId!: string;

  /**
   * @description The action that was performed on the target entity.
   * @example "created"
   */
  @Column({ type: 'varchar', length: 32 }) action!:
    | 'created'
    | 'updated'
    | 'submitted'
    | 'approved'
    | 'rejected'
    | 'deleted';

  /**
   * @description Optional: The unique identifier of the user who performed the action, if different from `userId`.
   * @example "a1c2t3o4-r5u6s7e8-9012-3456-7890abcdef"
   */
  @Column('uuid', { nullable: true }) actorUserId?: string;

  /**
   * @description Optional: A reason or comment for the action.
   * @example "Initial creation"
   */
  @Column({ type: 'text', nullable: true }) reason?: string;
  /**
   * @description Optional: A JSON object representing the difference in state before and after the action.
   * @example { "status": "DRAFT", "newStatus": "SUBMITTED" }
   */
  @Column({ type: 'jsonb', nullable: true }) diff?: IStringToStringDictionary;
  /**
   * @description Optional: Additional metadata related to the action.
   * @example { "ipAddress": "192.168.1.1" }
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: IStringToStringDictionary;

  /**
   * @description The timestamp when the action occurred.
   * @example "2024-01-01T10:00:00Z"
   */
  @Column({ type: 'timestamp with time zone', default: () => 'now()' })
  occurredAt!: Date;
}
