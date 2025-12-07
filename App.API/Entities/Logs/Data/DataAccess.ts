import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../BaseEntity';
import { Company } from '../../Companies/Company';
import User from '../../Users/User';

@Entity('data_access_logs')
@Index(['companyId', 'targetType', 'targetId'])
@Index(['companyId', 'actorUserId'])
export class DataAccessLog extends BaseEntity {
  @Column('uuid') companyId!: string;
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column('uuid', { nullable: true }) actorUserId?: string;
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actorUserId' })
  actorUser?: User;

  @Column({ type: 'varchar', length: 64 }) targetType!: string; // 'Timesheet','User'
  @Column('uuid') targetId!: string;

  @Column({ type: 'text', nullable: true }) purpose?: string; // why (optional)
  @Column({ type: 'inet', nullable: true }) ip?: string;
  @Column({ type: 'text', nullable: true }) userAgent?: string;
}
