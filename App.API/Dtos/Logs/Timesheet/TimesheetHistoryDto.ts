import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  IsUUID,
} from "class-validator";
import { IStringToStringDictionary } from "../../../Entities/Timesheets/TimesheetHistory";

export class FilterTimesheetHistoryDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  @IsIn(["Timesheet", "TimesheetEntry", "TimesheetApproval", "ActionCode"])
  targetType?:
    | "Timesheet"
    | "TimesheetEntry"
    | "TimesheetApproval"
    | "ActionCode";

  @IsUUID()
  @IsOptional()
  targetId?: string;
}

export class CreateTimesheetHistoryDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["Timesheet", "TimesheetEntry", "TimesheetApproval", "ActionCode"])
  targetType!:
    | "Timesheet"
    | "TimesheetEntry"
    | "TimesheetApproval"
    | "ActionCode";

  @IsUUID()
  @IsNotEmpty()
  targetId!: string;

  @IsString()
  @IsNotEmpty()
  action!:
    | "created"
    | "updated"
    | "submitted"
    | "approved"
    | "rejected"
    | "deleted";

  @IsOptional()
  diff?: IStringToStringDictionary;

  @IsOptional()
  metadata?: IStringToStringDictionary;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsUUID()
  @IsOptional()
  actorUserId?: string;
}

export class TimesheetHistoryResponseDto {
  id!: string;
  userId!: string;
  targetType!:
    | "Timesheet"
    | "TimesheetEntry"
    | "TimesheetApproval"
    | "ActionCode";
  targetId!: string;
  action!:
    | "created"
    | "updated"
    | "submitted"
    | "approved"
    | "rejected"
    | "deleted";
  diff?: IStringToStringDictionary;
  metadata?: IStringToStringDictionary;
  reason?: string;
  actorUserId?: string;
  occurredAt!: Date;
}
