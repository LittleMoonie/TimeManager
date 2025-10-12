import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { RolePermission } from "./RolePermission";
import User from "../Users/User";
import { Company } from "../Companies/Company";

@Entity("roles")
@Index(["companyId", "id"], { unique: true })
@Index(["companyId", "name"], { unique: true })
export class Role extends BaseEntity {
  @Column({ type: "uuid" }) companyId!: string;

  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column({ type: "varchar", length: 50, nullable: false }) name!: string;
  @Column({ type: "text", nullable: true }) description?: string;

  @OneToMany(() => RolePermission, (rp) => rp.role) rolePermissions!: RolePermission[];
  @OneToMany(() => User, (user) => user.role) users!: User[];
}
