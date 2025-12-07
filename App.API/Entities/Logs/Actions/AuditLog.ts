import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../BaseEntity';
import { Company } from '../../Companies/Company';
import User from '../../Users/User';

@Entity('audit_logs')
@Index(['companyId'])
@Index(['companyId', 'entity', 'entityId'])
@Index(['companyId', 'actorUserId'])
export class AuditLog extends BaseEntity {
  @Column('uuid') companyId!: string;
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column('uuid', { nullable: true }) actorUserId?: string;
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actorUserId' })
  actorUser?: User;

  @Column({ type: 'varchar', length: 64 }) entity!: string; // e.g., 'Timesheet', 'User'
  @Column('uuid') entityId!: string;

  @Column({ type: 'varchar', length: 32 }) action!: string; // e.g., 'create','update','approve'
  @Column({ type: 'jsonb', nullable: true }) diff?: Record<string, string>;
  @Column({ type: 'jsonb', nullable: true }) metadata?: Record<string, string>;

  // Request context (great for audits)
  @Column({ type: 'text', nullable: true }) requestId?: string;
  @Column({ type: 'inet', nullable: true }) ip?: string;
  @Column({ type: 'text', nullable: true }) userAgent?: string;
}
