import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../BaseEntity';

@Entity('email_logs')
@Index(['companyId', 'template'])
@Index(['companyId', 'toEmail'])
export class EmailLog extends BaseEntity {
  @Column('uuid', { nullable: true }) companyId?: string;

  @Column({ type: 'citext' }) toEmail!: string;
  @Column({ type: 'text', nullable: true }) toName?: string;

  @Column({ type: 'varchar', length: 64 }) template!: string; // e.g., 'invite','reset_password'
  @Column({ type: 'jsonb', nullable: true }) templateData?: Record<string, string>;

  @Column({ type: 'varchar', length: 16, default: 'QUEUED' }) status!: 'QUEUED' | 'SENT' | 'FAILED';
  @Column({ type: 'text', nullable: true }) providerMessageId?: string;
  @Column({ type: 'text', nullable: true }) error?: string;
  @Column({ type: 'timestamp with time zone', nullable: true }) sentAt?: Date;
}
