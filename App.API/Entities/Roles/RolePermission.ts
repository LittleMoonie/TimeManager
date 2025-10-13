import { Entity, ManyToOne, JoinColumn, Index, Column } from 'typeorm';
import { Role } from './Role';
import { Permission } from './Permission';
import { Company } from '../Companies/Company';
import { BaseEntity } from '../BaseEntity';

/**
 * @description Represents the many-to-many relationship between roles and permissions within a company.
 */
@Entity('role_permissions')
@Index(['companyId', 'roleId', 'permissionId'], { unique: true })
export class RolePermission extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this role-permission association belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid' }) companyId!: string;

  /**
   * @description The company associated with this role-permission.
   */
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The unique identifier of the role in this association.
   * @example "r1o2l3e4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid' }) roleId!: string;
  /**
   * @description The role in this association.
   */
  @ManyToOne(() => Role, { onDelete: 'RESTRICT' })
  @JoinColumn([
    { name: 'roleId', referencedColumnName: 'id' },
    { name: 'companyId', referencedColumnName: 'companyId' },
  ])
  role!: Role;

  /**
   * @description The unique identifier of the permission in this association.
   * @example "p1e2r3m4-i5s6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid' }) permissionId!: string;
  /**
   * @description The permission in this association.
   */
  @ManyToOne(() => Permission, { onDelete: 'RESTRICT' })
  @JoinColumn([
    { name: 'permissionId', referencedColumnName: 'id' },
    { name: 'companyId', referencedColumnName: 'companyId' },
  ])
  permission!: Permission;
}
