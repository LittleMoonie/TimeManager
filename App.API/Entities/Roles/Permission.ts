import { Entity, Column, OneToMany, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { RolePermission } from "./RolePermission";
import { Company } from "../Companies/Company";

@Entity("permissions")
@Index(["companyId", "id"], { unique: true })
@Index(["companyId", "name"], { unique: true })
export class Permission extends BaseEntity {
  @Column({ type: "uuid" }) companyId!: string;

  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column({ type: "varchar", length: 100, nullable: false }) name!: string;
  @Column({ type: "text", nullable: true }) description?: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions!: RolePermission[];
}
