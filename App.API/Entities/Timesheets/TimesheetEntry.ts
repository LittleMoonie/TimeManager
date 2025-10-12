import { Column, Entity, ManyToOne, Check, Index, JoinColumn } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import User from "../Users/User";
import { Company } from "../Companies/Company";
import { ActionCode } from "./ActionCode";
import { Timesheet } from "./Timesheet";

export enum WorkMode {
  OFFICE = "office",
  REMOTE = "remote",
  HYBRID = "hybrid",
}

@Entity("timesheet_entries")
@Check(`"durationMin" BETWEEN 0 AND 1440`)
@Index(["companyId", "userId", "day"])
@Index(["companyId", "timesheetId"])
export class TimesheetEntry extends BaseEntity {
  @Column("uuid") companyId!: string;
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column("uuid") userId!: string;
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid", { nullable: true }) timesheetId?: string;
  @ManyToOne(() => Timesheet, (t) => t.entries, { onDelete: "SET NULL" })
  @JoinColumn({ name: "timesheetId" })
  timesheet?: Timesheet;

  @Column("uuid") actionCodeId!: string;
  @ManyToOne(() => ActionCode, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "actionCodeId" })
  actionCode!: ActionCode;

  @Column({ type: "varchar", length: 8, default: WorkMode.OFFICE })
  workMode!: WorkMode;

  @Column({ type: "varchar", length: 2 }) country!: string;

  @Column({ type: "timestamp with time zone", nullable: true }) startedAt?: Date;
  @Column({ type: "timestamp with time zone", nullable: true }) endedAt?: Date;

  @Column("int") durationMin!: number; // store computed duration for fast totals
  @Column("date") day!: string; // denormalized day for quick filtering
  @Column({ type: "text", nullable: true }) note?: string;
}
