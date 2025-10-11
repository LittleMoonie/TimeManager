import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
} from "class-validator";
import { ApprovalStatus } from "../../Entities/Timesheets/TimesheetApproval";

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
