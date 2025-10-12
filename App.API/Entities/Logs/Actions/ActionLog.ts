import { Entity, Column, ManyToOne, Index, JoinColumn } from "typeorm";
import { BaseEntity } from "../../BaseEntity";
import { Company } from "../../Companies/Company";
import User from "../../Users/User";

export interface IStringToStringDictionary {
  [key: string]: string;
}

export enum ActionLogType {
  VIEW = "VIEW",
  CLICK = "CLICK",
  SUBMIT = "SUBMIT",
  DOWNLOAD = "DOWNLOAD",
}

@Entity("action_logs")
@Index(["companyId", "userId"])
@Index(["companyId", "actionType"])
export class ActionLog extends BaseEntity {
  @Column("uuid") companyId!: string;
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column({ type: "uuid", nullable: true }) userId?: string;
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user?: User;

  @Column({ type: "varchar", length: 32 }) actionType!: ActionLogType;

  @Column({ type: "text" }) description!: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: IStringToStringDictionary;
}
