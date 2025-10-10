import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import User from './User';

@Entity('user_statuses')
export class UserStatus extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => User, (user) => user.status)
  users!: User[];
}
