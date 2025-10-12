import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsIn,
  IsUUID,
  IsEnum,
  IsISO8601,
  IsObject,
} from "class-validator";
import { ApprovalStatus } from "../../Entities/Timesheets/TimesheetApproval";
import { WorkMode } from "../../Entities/Timesheets/TimesheetEntry";

/* --------------------------------- ActionCode --------------------------------- */

export class CreateActionCodeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class UpdateActionCodeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}

/* -------------------------------- Timesheet(s) -------------------------------- */

export class CreateTimesheetDto {
  @IsDateString()
  @IsNotEmpty()
  periodStart!: string;

  @IsDateString()
  @IsNotEmpty()
  periodEnd!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

/* ------------------------------ Timesheet Entry ------------------------------- */

export class CreateTimesheetEntryDto {
  @IsString()
  @IsNotEmpty()
  actionCodeId!: string;

  @IsDateString()
  @IsNotEmpty()
  day!: string;

  @IsInt()
  @Min(0)
  @Max(1440)
  durationMin!: number;

  /** ISO 3166-1 alpha-2 */
  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsOptional()
  @IsIn(["office", "remote", "hybrid"])
  workMode?: WorkMode;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateTimesheetEntryDto {
  @IsString()
  @IsOptional()
  actionCodeId?: string;

  @IsDateString()
  @IsOptional()
  day?: string;

  @IsInt()
  @Min(0)
  @Max(1440)
  @IsOptional()
  durationMin?: number;

  @IsString()
  @IsOptional()
  country?: string;

  @IsOptional()
  @IsIn(["office", "remote", "hybrid"])
  workMode?: WorkMode;

  @IsString()
  @IsOptional()
  note?: string;
}

export class TimesheetEntryResponseDto {
  id!: string;
  actionCodeId!: string;
  day!: string;
  durationMin!: number;
  country!: string;
  workMode!: WorkMode;
  note?: string;
}

/* ---------------------------- Timesheet Approvals ----------------------------- */

export class CreateTimesheetApprovalDto {
  @IsUUID()
  @IsNotEmpty()
  timesheetId!: string;

  @IsUUID()
  @IsNotEmpty()
  approverId!: string;
}

export class UpdateTimesheetApprovalDto {
  @IsEnum(ApprovalStatus)
  @IsNotEmpty()
  status!: ApprovalStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class TimesheetApprovalResponseDto {
  id!: string;
  timesheetId!: string;
  approverId!: string;
  status!: ApprovalStatus;
  reason?: string;
  decidedAt?: Date;
}

/* ------------------------------- Record History ------------------------------- */

const TARGET_TYPES = ["Timesheet", "TimesheetEntry", "TimesheetApproval", "ActionCode"] as const;
type TargetType = typeof TARGET_TYPES[number];

const ACTIONS = ["created", "updated", "submitted", "approved", "rejected", "deleted"] as const;
type ActionType = typeof ACTIONS[number];

export class RecordHistoryDto {
  @IsIn(TARGET_TYPES as unknown as string[])
  targetType!: TargetType;

  @IsUUID()
  targetId!: string;

  @IsIn(ACTIONS as unknown as string[])
  action!: ActionType;

  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsObject()
  diff?: Record<string, string>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;

  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  @IsOptional()
  @IsString()
  hash?: string;
}
