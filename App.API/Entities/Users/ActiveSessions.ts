import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import User from "./User";
import { Company } from "../Companies/Company";

@Entity("active_sessions")
@Index(["companyId", "userId"])
@Index(["tokenHash"], { unique: true })
@Index(["expiresAt"])
export default class ActiveSession extends BaseEntity {
  @Column({ type: "uuid" }) companyId!: string;

  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column({ type: "uuid" }) userId!: string;

  @ManyToOne(() => User, (user) => user.activeSessions, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "text" }) tokenHash!: string;
  @Column({ type: "text", nullable: true }) previousTokenHash?: string;

  @Column({ type: "timestamp with time zone", nullable: true }) expiresAt?: Date;
  @Column({ type: "timestamp with time zone", nullable: true }) revokedAt?: Date;
  @Column({ type: "timestamp with time zone", nullable: true }) lastSeenAt?: Date;

  @Column({ type: "inet", nullable: true }) ip?: string;
  @Column({ type: "text", nullable: true }) userAgent?: string;
  @Column({ type: "text", nullable: true }) deviceId?: string;
}
