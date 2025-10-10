
import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import User from './user';
import { Organization } from './organization';

export enum AuditLogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Entity()
export class AuditLog extends BaseEntity {
  @ManyToOne(() => User)
  actorUser!: User;

  @ManyToOne(() => Organization)
  organization!: Organization;

  @Column({ type: 'varchar', length: 255 })
  entity!: string;

  @Column({ type: 'uuid' })
  entityId!: string;

  @Column({ type: 'enum', enum: AuditLogAction })
  action!: AuditLogAction;

  @Column({ type: 'jsonb' })
  diff!: any;

  @CreateDateColumn({ type: 'timestamptz' })
  at!: Date;
}
