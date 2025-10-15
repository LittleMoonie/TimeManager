import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../BaseEntity';
import { Company } from '../../Companies/Company';
import User from '../../Users/User';

export enum UserActivityType {
  // User actions
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  CHANGE_USER_STATUS = 'CHANGE_USER_STATUS',

  // Role actions
  CREATE_ROLE = 'CREATE_ROLE',
  UPDATE_ROLE = 'UPDATE_ROLE',
  DELETE_ROLE = 'DELETE_ROLE',
  ADD_PERMISSION_TO_ROLE = 'ADD_PERMISSION_TO_ROLE',
  REMOVE_PERMISSION_FROM_ROLE = 'REMOVE_PERMISSION_FROM_ROLE',

  // Permission actions
  CREATE_PERMISSION = 'CREATE_PERMISSION',
  UPDATE_PERMISSION = 'UPDATE_PERMISSION',
  DELETE_PERMISSION = 'DELETE_PERMISSION',
}

@Entity('user_activity_logs')
@Index(['companyId', 'userId'])
@Index(['companyId', 'activityType'])
@Index(['companyId', 'targetId'])
export class UserActivityLog extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId!: string;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'enum',
    enum: UserActivityType,
  })
  activityType!: UserActivityType;

  @Column({ type: 'uuid', nullable: true })
  targetId?: string;

  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, string>;
}
