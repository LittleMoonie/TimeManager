import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Company } from "../Companies/Company";
import { Timesheet } from "./Timesheet";
import User from "../Users/User";

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

@Entity("timesheet_approvals")
@Index(["companyId", "timesheetId", "approverId"], { unique: true })
export class TimesheetApproval extends BaseEntity {
  @Column("uuid") companyId!: string;
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column("uuid") timesheetId!: string;
  @ManyToOne(() => Timesheet, { onDelete: "CASCADE" })
  @JoinColumn({ name: "timesheetId" })
  timesheet!: Timesheet;

  @Column("uuid") approverId!: string;
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "approverId" })
  approver!: User;

  @Column({ type: "varchar", length: 16, default: ApprovalStatus.PENDING })
  status!: ApprovalStatus;

  @Column({ type: "text", nullable: true }) reason?: string;
  @Column({ type: "timestamp with time zone", nullable: true }) decidedAt?: Date;
}
