import { Entity, ManyToOne, JoinColumn, Index, Column } from "typeorm";
import { Role } from "./Role";
import { Permission } from "./Permission";
import { Company } from "../Companies/Company";
import { BaseEntity } from "../BaseEntity";

@Entity("role_permissions")
@Index(["companyId", "roleId", "permissionId"], { unique: true })
export class RolePermission extends BaseEntity {
  @Column({ type: "uuid" }) companyId!: string;

  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column({ type: "uuid" }) roleId!: string;
  @ManyToOne(() => Role, { onDelete: "RESTRICT" })
  @JoinColumn([
    { name: "roleId", referencedColumnName: "id" },
    { name: "companyId", referencedColumnName: "companyId" },
  ])
  role!: Role;

  @Column({ type: "uuid" }) permissionId!: string;
  @ManyToOne(() => Permission, { onDelete: "RESTRICT" })
  @JoinColumn([
    { name: "permissionId", referencedColumnName: "id" },
    { name: "companyId", referencedColumnName: "companyId" },
  ])
  permission!: Permission;
}
