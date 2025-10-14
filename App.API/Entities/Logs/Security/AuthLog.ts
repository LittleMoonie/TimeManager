import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../BaseEntity';
import { Company } from '../../Companies/Company';
import User from '../../Users/User';

export interface IStringToStringDictionary {
  [key: string]: string;
}

export enum AuthLogAction {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
}

@Entity('auth_logs')
@Index(['companyId', 'userId'])
@Index(['companyId', 'action'])
export class AuthLog extends BaseEntity {
  @Column('uuid') companyId!: string;
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column({ type: 'uuid', nullable: true }) userId?: string;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'varchar', length: 32 }) action!: AuthLogAction;

  @Column({ type: 'inet', nullable: true }) ip?: string;

  @Column({ type: 'text', nullable: true }) userAgent?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: IStringToStringDictionary;
}
