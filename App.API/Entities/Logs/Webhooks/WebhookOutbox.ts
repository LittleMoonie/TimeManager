import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../BaseEntity';
import { Company } from '../../Companies/Company';

@Entity('webhook_outbox')
@Index(['companyId', 'eventType'])
@Index(['companyId', 'status'])
export class WebhookOutbox extends BaseEntity {
  @Column('uuid') companyId!: string;
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column({ type: 'varchar', length: 64 }) eventType!: string; // e.g., 'timesheet.submitted'
  @Column({ type: 'jsonb' }) payload!: Record<string, string>;

  @Column({ type: 'varchar', length: 16, default: 'PENDING' }) status!:
    | 'PENDING'
    | 'SENDING'
    | 'SENT'
    | 'FAILED';
  @Column({ type: 'int', default: 0 }) attempt!: number;
  @Column({ type: 'timestamp with time zone', nullable: true })
  nextAttemptAt?: Date;
  @Column({ type: 'text', nullable: true }) lastError?: string;
}
