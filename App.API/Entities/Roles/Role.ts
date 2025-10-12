import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { RolePermission } from "./RolePermission";
import User from "../Users/User";
import { Company } from "../Companies/Company";

/**
 * @description Represents a user role within a company, defining a set of permissions.
 */
@Entity("roles")
@Index(["companyId", "id"], { unique: true })
@Index(["companyId", "name"], { unique: true })
export class Role extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this role belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) companyId!: string;

  /**
   * @description The company associated with this role.
   */
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The name of the role (e.g., "Admin", "Manager", "Employee").
   * @example "Admin"
   */
  @Column({ type: "varchar", length: 50, nullable: false }) name!: string;
  /**
   * @description Optional: A detailed description of the role's responsibilities or privileges.
   * @example "Administrator with full access to all company resources."
   */
  @Column({ type: "text", nullable: true }) description?: string;

  /**
   * @description List of permissions assigned to this role.
   */
  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions!: RolePermission[];
  /**
   * @description List of users assigned to this role.
   */
  @OneToMany(() => User, (user) => user.role) users!: User[];
}
