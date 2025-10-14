import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../BaseEntity';
import { Company } from '../../Companies/Company';
import User from '../../Users/User';

export interface IStringToStringDictionary {
  [key: string]: string;
}

export enum ErrorLogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

@Entity('error_logs')
@Index(['companyId', 'level'])
@Index(['companyId', 'userId'])
export class ErrorLog extends BaseEntity {
  @Column('uuid') companyId!: string;
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column({ type: 'uuid', nullable: true }) userId?: string;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'varchar', length: 16 }) level!: ErrorLogLevel;

  @Column('text') message!: string;

  @Column({ type: 'text', nullable: true }) stack?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: IStringToStringDictionary;
}
