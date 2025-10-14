import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../BaseEntity';

@Entity('app_errors')
@Index(['companyId', 'level'])
@Index(['companyId', 'service'])
export class AppError extends BaseEntity {
  @Column('uuid', { nullable: true }) companyId?: string; // may be null for platform errors

  @Column({ type: 'varchar', length: 16, default: 'ERROR' }) level!:
    | 'DEBUG'
    | 'INFO'
    | 'WARN'
    | 'ERROR'
    | 'FATAL';
  @Column({ type: 'varchar', length: 64 }) service!: string; // e.g., 'api','worker'
  @Column({ type: 'varchar', length: 128, nullable: true }) code?: string; // app-specific code

  @Column({ type: 'text' }) message!: string;
  @Column({ type: 'text', nullable: true }) stack?: string;

  @Column({ type: 'jsonb', nullable: true }) context?: Record<string, string>; // route, params, userId, requestId, etc.
}
