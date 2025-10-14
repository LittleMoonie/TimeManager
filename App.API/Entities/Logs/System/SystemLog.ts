import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../BaseEntity';
import { Company } from '../../Companies/Company';

export interface IStringToStringDictionary {
  [key: string]: string;
}

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

@Entity('system_logs')
@Index(['companyId', 'level'])
export class SystemLog extends BaseEntity {
  @Column('uuid') companyId!: string;
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column({ type: 'varchar', length: 16 }) level!: LogLevel;

  @Column('text') message!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: IStringToStringDictionary;
}
