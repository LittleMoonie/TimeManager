
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Organization } from './organization';

export enum ActionCodeType {
  BILLABLE = 'billable',
  NON_BILLABLE = 'non-billable',
}

@Entity()
@Unique(['organization', 'code'])
export class ActionCode extends BaseEntity {
  @ManyToOne(() => Organization, (org) => org.actionCodes)
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
