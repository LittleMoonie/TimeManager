import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import User from '../Users/User';
import { Organization } from '../Company/Company';

export interface IRecordOfAny {
  [key: string]: any;
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Entity()
@Index(['orgId'])
@Index(['entity', 'entityId'])
@Index(['orgId', 'actorUserId'])
export class AuditLog extends BaseEntity {
  @Column({ type: 'uuid' })
  actorUserId!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actorUserId' })
  actorUser!: User;

  @Column({ type: 'uuid' })
  orgId!: string;

  @ManyToOne(() => Organization, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'orgId' })
  organization!: Organization;

  @Column({ type: 'varchar', length: 255 })
  entity!: string; // e.g., 'TimesheetEntry', 'User'

  @Column({ type: 'uuid' })
  entityId!: string; // ID of the entity that was affected

  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction;

  @Column({ type: 'jsonb', nullable: true })
  diff?: IRecordOfAny; // JSONB to store the changes

  // 'at' column is handled by BaseEntity's createdAt, which is TIMESTAMPTZ DEFAULT now()
}