import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import User from "./User";

@Entity("user_statuses")
export class UserStatus extends BaseEntity {
  @Column({ type: "varchar", length: 50, unique: true, nullable: false })
  code!: string; // e.g. INVITED, ACTIVE, SUSPENDED, TERMINATED

  @Column({ type: "varchar", length: 50, unique: true, nullable: false })
  name!: string; // Display label

  @Column({ type: "text", nullable: true }) description?: string;

  @Column({ type: "boolean", default: true }) canLogin!: boolean;
  @Column({ type: "boolean", default: false }) isTerminal!: boolean;

  @OneToMany(() => User, (user) => user.status)
  users!: User[];
}
