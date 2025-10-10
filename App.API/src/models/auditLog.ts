import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import User from './user';
import { Organization } from './organization';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Entity()
@Index(['orgId'])
@Index(['entity', 'entityId'])
export class AuditLog extends BaseEntity {
  @Column({ type: 'uuid' })
  actorUserId!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  actorUser!: User;

  @Column({ type: 'uuid' })
  orgId!: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization!: Organization;

  @Column({ type: 'varchar', length: 255 })
  entity!: string; // e.g., 'TimesheetEntry', 'User'

  @Column({ type: 'uuid' })
  entityId!: string; // ID of the entity that was affected

  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction;

  @Column({ type: 'jsonb', nullable: true })
  diff?: object; // JSONB to store the changes

  // 'at' column is handled by BaseEntity's createdAt, which is TIMESTAMPTZ DEFAULT now()
}