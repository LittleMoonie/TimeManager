import { Entity, Column, ManyToOne, Index, JoinColumn } from "typeorm";
import { BaseEntity } from "../../BaseEntity";
import { Company } from "../../Companies/Company";
import User from "../../Users/User";

export enum DataLogAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

@Entity("data_logs")
@Index(["companyId", "userId"])
@Index(["companyId", "entityType", "entityId"])
export class DataLog extends BaseEntity {
  @Column("uuid") companyId!: string;
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column({ type: "uuid", nullable: true }) userId?: string;
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user?: User;

  @Column({ type: "varchar", length: 32 }) action!: DataLogAction;

  @Column({ type: "text" }) entityType!: string;

  @Column({ type: "uuid" }) entityId!: string;

  @Column({ type: "jsonb", nullable: true }) oldValue?: Record<string, string>;

  @Column({ type: "jsonb", nullable: true }) newValue?: Record<string, string>;

  @Column({ type: "text", nullable: true }) description?: string;
}
