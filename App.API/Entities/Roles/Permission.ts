import { Entity, Column, OneToMany, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../BaseEntity';
import { Company } from '../Companies/Company';

import { RolePermission } from './RolePermission';

/**
 * @description Represents a specific permission that can be assigned to roles within a company.
 */
@Entity('permissions')
@Index(['companyId', 'id'], { unique: true })
@Index(['companyId', 'name'], { unique: true })
export class Permission extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this permission belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid' }) companyId!: string;

  /**
   * @description The company associated with this permission.
   */
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The name of the permission (e.g., "create_user", "delete_timesheet").
   * @example "create_user"
   */
  @Column({ type: 'varchar', length: 100, nullable: false }) name!: string;
  /**
   * @description Optional: A detailed description of what this permission allows.
   * @example "Allows creation of new user accounts"
   */
  @Column({ type: 'text', nullable: true }) description?: string;

  /**
   * @description List of role-permission associations for this permission.
   */
  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions!: RolePermission[];
}
