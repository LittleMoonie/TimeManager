import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import { RolePermission } from './RolePermission';
import User from './User';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions!: RolePermission[];

  @OneToMany(() => User, (user) => user.role)
  users!: User[];
}
