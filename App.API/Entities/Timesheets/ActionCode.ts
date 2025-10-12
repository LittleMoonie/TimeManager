import { Column, Entity, ManyToOne, Index, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Company } from "../Companies/Company";

export enum ActionCodeType {
  BILLABLE = "billable",
  NON_BILLABLE = "non-billable",
}

@Entity("action_codes")
@Unique(["companyId", "code"])
@Index(["companyId", "code"])
export class ActionCode extends BaseEntity {
  @Column("uuid") companyId!: string;
  @ManyToOne(() => Company, (c) => c.actionCodes, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column({ type: "varchar", length: 255 }) code!: string;
  @Column({ type: "varchar", length: 255 }) name!: string;

  @Column({ type: "varchar", length: 16, default: ActionCodeType.BILLABLE })
  type!: ActionCodeType;

  @Column({ type: "boolean", default: true }) active!: boolean;
}
