import { Entity, Column, ManyToOne, Index, JoinColumn } from "typeorm";
import { BaseEntity } from "../../BaseEntity";
import { Company } from "../../Companies/Company";

export interface IStringToStringDictionary {
  [key: string]: string;
}

export enum WebhookLogType {
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
}

@Entity("webhook_logs")
@Index(["companyId", "type"])
@Index(["companyId", "event"])
export class WebhookLog extends BaseEntity {
  @Column("uuid") companyId!: string;
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column({ type: "varchar", length: 16 }) type!: WebhookLogType;

  @Column({ type: "text" }) event!: string;

  @Column({ type: "jsonb", nullable: true })
  payload?: IStringToStringDictionary;

  @Column({ type: "jsonb", nullable: true })
  response?: IStringToStringDictionary;

  @Column({ type: "int", nullable: true }) statusCode?: number;

  @Column({ type: "text", nullable: true }) url?: string;

  @Column({ type: "text", nullable: true }) error?: string;
}
