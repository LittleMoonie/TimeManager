import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import { Company } from '../Company/Company';

@Entity('timesheet_history')
@Index(['companyId', 'userId'])
@Index(['companyId', 'targetType', 'targetId'])
export class TimesheetHistory extends BaseEntity {
  @Column('uuid') companyId!: string;
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'companyId' }) company!: Company;
  
  @Column('uuid') userId!: string; // owner of timesheet/entry

  @Column({ type: 'varchar', length: 32 }) targetType!: 'Timesheet' | 'TimesheetEntry' | 'TimesheetApproval';
  @Column('uuid') targetId!: string;

  @Column({ type: 'varchar', length: 32 }) action!: 'created'|'updated'|'submitted'|'approved'|'rejected'|'deleted';

  @Column('uuid', { nullable: true }) actorUserId?: string;

  @Column({ type: 'text', nullable: true }) reason?: string;
  @Column({ type: 'jsonb', nullable: true }) diff?: object;
  @Column({ type: 'jsonb', nullable: true }) metadata?: object;

  @Column({ type: 'timestamp with time zone', default: () => 'now()' }) occurredAt!: Date;
}

