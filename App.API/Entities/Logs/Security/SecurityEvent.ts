import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../BaseEntity";
import { Company } from "../../Companies/Company";
import User from "../../Users/User";

@Entity("security_events")
@Index(["companyId", "eventType"])
@Index(["companyId", "subjectType", "subjectId"])
export class SecurityEvent extends BaseEntity {
  @Column("uuid") companyId!: string;
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column({ type: "varchar", length: 48 }) eventType!: string; // e.g., 'ROLE_CHANGED','SESSION_REVOKED','STATUS_CHANGED'

  // "Who did it"
  @Column("uuid", { nullable: true }) actorUserId?: string;
  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "actorUserId" })
  actorUser?: User;

  // "What it targeted"
  @Column({ type: "varchar", length: 48 }) subjectType!: string; // 'User','Timesheet','Role'
  @Column("uuid") subjectId!: string;

  @Column({ type: "jsonb", nullable: true }) details?: Record<string, string>;

  @Column({ type: "inet", nullable: true }) ip?: string;
  @Column({ type: "text", nullable: true }) userAgent?: string;
}
