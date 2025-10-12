import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsUUID,
  IsDateString,
} from "class-validator";
import { ApproverPolicy } from "@/Entities/Companies/CompanySettings";
import { LeaveRequestStatus, LeaveType } from "@/Entities/Companies/LeaveRequest";

/* ----------------------------------- Company ----------------------------------- */

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

export class CompanyResponseDto {
  id!: string;
  name!: string;
  timezone?: string;
}

/* ------------------------------- Company Settings ------------------------------ */

export class UpdateCompanySettingsDto {
  @IsString()
  @IsOptional()
  timezone?: string;

  @IsOptional()
  workWeek?: Record<string, number[]>;

  @IsString()
  @IsOptional()
  holidayCalendar?: string;

  @IsEnum(ApproverPolicy)
  @IsOptional()
  timesheetApproverPolicy?: ApproverPolicy;

  @IsArray()
  @IsOptional()
  allowedEmailDomains?: string[];

  @IsBoolean()
  @IsOptional()
  requireCompanyEmail?: boolean;
}

export class CompanySettingsResponseDto {
  companyId!: string;
  timezone!: string;
  workWeek!: Record<string, number[]>;
  holidayCalendar?: string;
  timesheetApproverPolicy!: ApproverPolicy;
  allowedEmailDomains?: string[];
  requireCompanyEmail!: boolean;
}

/* ------------------------------------ Teams ------------------------------------ */

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;
}

export class TeamResponseDto {
  id!: string;
  name!: string;
  companyId!: string;
}

export class AddTeamMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  role!: string;
}

export class TeamMemberResponseDto {
  id!: string;
  teamId!: string;
  userId!: string;
  role!: string;
}

/* --------------------------------- Leave Request -------------------------------- */

export class CreateLeaveRequestDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @IsEnum(LeaveType)
  @IsNotEmpty()
  leaveType!: LeaveType;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateLeaveRequestDto {
  @IsEnum(LeaveRequestStatus)
  @IsOptional()
  status?: LeaveRequestStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class LeaveRequestResponseDto {
  id!: string;
  userId!: string;
  startDate!: Date;
  endDate!: Date;
  leaveType!: LeaveType;
  status!: LeaveRequestStatus;
  reason?: string;
  rejectionReason?: string;
}
