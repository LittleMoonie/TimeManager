
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import { Organization } from '../Company/Company';

export enum ActionCodeType {
  BILLABLE = 'billable',
  NON_BILLABLE = 'non-billable',
}

@Entity()
@Unique(['orgId', 'code'])
@Index(['orgId', 'code'])
export class ActionCode extends BaseEntity {
  @Column({ type: 'uuid' })
  orgId!: string;

  @ManyToOne(() => Organization, (org) => org.actionCodes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'orgId' })
  organization!: Organization;

  @Column({ type: 'varchar', length: 255 })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'enum', enum: ActionCodeType, default: ActionCodeType.BILLABLE })
  type!: ActionCodeType;

  @Column({ type: 'boolean', default: true })
  active!: boolean;
}
