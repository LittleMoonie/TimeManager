import { Column, Entity, ManyToOne, Index, JoinColumn, Unique } from 'typeorm';

import { BaseEntity } from '../BaseEntity';
import { Company } from '../Companies/Company';

/**
 * @description Defines the type of an action code, indicating if it's billable or non-billable.
 */
export enum ActionCodeType {
  BILLABLE = 'billable',
  NON_BILLABLE = 'non-billable',
}

export enum ActionCodeBillableDefault {
  BILLABLE = 'billable',
  NON_BILLABLE = 'non-billable',
  AUTO = 'auto',
}

export enum ActionCodeLocationPolicy {
  ANY = 'any',
  OFFICE_ONLY = 'office_only',
  HOMEWORKING_ONLY = 'homeworking_only',
}

/**
 * @description Represents an action code used for categorizing timesheet entries within a company.
 */
@Entity('action_codes')
@Unique(['companyId', 'code'])
@Index(['companyId', 'code'])
export class ActionCode extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this action code belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column('uuid') companyId!: string;

  /**
   * @description The company associated with this action code.
   */
  @ManyToOne(() => Company, (c) => c.actionCodes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description A unique short code for the action (e.g., "DEV", "MEETING").
   * @example "DEV"
   */
  @Column({ type: 'varchar', length: 255 }) code!: string;
  /**
   * @description The display name of the action code (e.g., "Development", "Team Meeting").
   * @example "Development"
   */
  @Column({ type: 'varchar', length: 255 }) name!: string;

  /**
   * @description A color associated with the action code, in hexadecimal format (e.g., #RRGGBB).
   * @example "#FF5733"
   */
  @Column({ type: 'varchar', length: 7, default: '#000000' }) color!: string;

  /**
   * @description The type of the action code, indicating if it's billable or non-billable.
   * @example "billable"
   */
  @Column({ type: 'varchar', length: 16, default: ActionCodeType.BILLABLE })
  type!: ActionCodeType;

  /**
   * @description Indicates if the action code is currently active.
   * @example true
   */
  @Column({ type: 'boolean', default: true }) active!: boolean;

  /**
   * @description Default billable behaviour for rows using this time code.
   */
  @Column({
    type: 'varchar',
    length: 24,
    default: ActionCodeBillableDefault.AUTO,
  })
  billableDefault!: ActionCodeBillableDefault;

  /**
   * @description Whether users can change the billable flag for this time code.
   */
  @Column({ type: 'boolean', default: false })
  billableEditable!: boolean;

  /**
   * @description Location policy enforced by this time code.
   */
  @Column({
    type: 'varchar',
    length: 32,
    default: ActionCodeLocationPolicy.ANY,
  })
  locationPolicy!: ActionCodeLocationPolicy;
}
