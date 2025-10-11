import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../BaseEntity';

@Entity('login_attempts')
@Index(['companyId', 'email'])
@Index(['companyId', 'userId'])
export class LoginAttempt extends BaseEntity {
  @Column('uuid') companyId!: string;

  @Column({ type: 'citext' }) email!: string; // as entered
  @Column('uuid', { nullable: true }) userId?: string; // filled on success or when user is found

  @Column({ type: 'boolean', default: false }) succeeded!: boolean;
  @Column({ type: 'varchar', length: 32, nullable: true }) reason?: string; // BAD_PASSWORD, LOCKED, etc.

  @Column({ type: 'inet', nullable: true }) ip?: string;
  @Column({ type: 'text', nullable: true }) userAgent?: string;

  @Column({ type: 'timestamp with time zone', default: () => 'now()' }) occurredAt!: Date;
}
