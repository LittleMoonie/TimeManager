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
import { ApproverPolicy } from "../../Entities/Companies/CompanySettings";
import {
  LeaveRequestStatus,
  LeaveType,
} from "../../Entities/Companies/LeaveRequest";

/* ----------------------------------- Company ----------------------------------- */

/**
 * @description Data transfer object for creating a new company.
 */
export class CreateCompanyDto {
  /**
   * @description The name of the company.
   * @example "Acme Corp"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * @description Optional: The timezone of the company (e.g., "America/New_York").
   * @example "America/New_York"
   */
  @IsString()
  @IsOptional()
  timezone?: string;
}

/**
 * @description Data transfer object for updating an existing company.
 */
export class UpdateCompanyDto {
  /**
   * @description Optional: The updated name of the company.
   * @example "Acme Corporation"
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * @description Optional: The updated timezone of the company.
   * @example "America/Los_Angeles"
   */
  @IsString()
  @IsOptional()
  timezone?: string;
}

/**
 * @description Data transfer object for a company response.
 */
export class CompanyResponseDto {
  /**
   * @description The unique identifier of the company.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  id!: string;
  /**
   * @description The name of the company.
   * @example "Acme Corp"
   */
  name!: string;
  /**
   * @description Optional: The timezone of the company.
   * @example "America/New_York"
   */
  timezone?: string;
}

/* ------------------------------- Company Settings ------------------------------ */

/**
 * @description Data transfer object for updating company settings.
 */
export class UpdateCompanySettingsDto {
  /**
   * @description Optional: The updated timezone for the company.
   * @example "Europe/London"
   */
  @IsString()
  @IsOptional()
  timezone?: string;

  /**
   * @description Optional: The updated work week configuration (e.g., { "monday": [9, 17], "tuesday": [9, 17] }).
   * @example { "monday": [9, 17], "tuesday": [9, 17] }
   */
  @IsOptional()
  workWeek?: Record<string, number[]>;

  /**
   * @description Optional: The updated holiday calendar identifier.
   * @example "us_federal_holidays"
   */
  @IsString()
  @IsOptional()
  holidayCalendar?: string;

  /**
   * @description Optional: The updated policy for timesheet approvals.
   * @example "manager_approval"
   */
  @IsEnum(ApproverPolicy)
  @IsOptional()
  timesheetApproverPolicy?: ApproverPolicy;

  /**
   * @description Optional: An array of allowed email domains for new user registrations.
   * @example ["example.com", "another.org"]
   */
  @IsArray()
  @IsOptional()
  allowedEmailDomains?: string[];

  /**
   * @description Optional: Indicates if new user registrations must use a company email domain.
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  requireCompanyEmail?: boolean;
}

/**
 * @description Data transfer object for company settings response.
 */
export class CompanySettingsResponseDto {
  /**
   * @description The unique identifier of the company these settings belong to.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  companyId!: string;
  /**
   * @description The timezone of the company.
   * @example "Europe/London"
   */
  timezone!: string;
  /**
   * @description The work week configuration.
   * @example { "monday": [9, 17], "tuesday": [9, 17] }
   */
  workWeek!: Record<string, number[]>;
  /**
   * @description Optional: The holiday calendar identifier.
   * @example "us_federal_holidays"
   */
  holidayCalendar?: string;
  /**
   * @description The policy for timesheet approvals.
   * @example "manager_approval"
   */
  timesheetApproverPolicy!: ApproverPolicy;
  /**
   * @description Optional: An array of allowed email domains for new user registrations.
   * @example ["example.com", "another.org"]
   */
  allowedEmailDomains?: string[];
  /**
   * @description Indicates if new user registrations must use a company email domain.
   * @example true
   */
  requireCompanyEmail!: boolean;
}

/* ------------------------------------ Teams ------------------------------------ */

/**
 * @description Data transfer object for creating a new team.
 */
export class CreateTeamDto {
  /**
   * @description The name of the team.
   * @example "Engineering"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;
}

/**
 * @description Data transfer object for updating an existing team.
 */
export class UpdateTeamDto {
  /**
   * @description Optional: The updated name of the team.
   * @example "Product Development"
   */
  @IsString()
  @IsOptional()
  name?: string;
}

/**
 * @description Data transfer object for a team response.
 */
export class TeamResponseDto {
  /**
   * @description The unique identifier of the team.
   * @example "g1h2i3j4-k5l6-7890-1234-567890abcdef"
   */
  id!: string;
  /**
   * @description The name of the team.
   * @example "Engineering"
   */
  name!: string;
  /**
   * @description The unique identifier of the company the team belongs to.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  companyId!: string;
}

/**
 * @description Data transfer object for adding a member to a team.
 */
export class AddTeamMemberDto {
  /**
   * @description The unique identifier of the user to add to the team.
   * @example "m1n2o3p4-q5r6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  /**
   * @description The role of the user within the team (e.g., "member", "lead").
   * @example "member"
   */
  @IsString()
  @IsNotEmpty()
  role!: string;
}

/**
 * @description Data transfer object for a team member response.
 */
export class TeamMemberResponseDto {
  /**
   * @description The unique identifier of the team member entry.
   * @example "x1y2z3a4-b5c6-7890-1234-567890abcdef"
   */
  id!: string;
  /**
   * @description The unique identifier of the team the member belongs to.
   * @example "g1h2i3j4-k5l6-7890-1234-567890abcdef"
   */
  teamId!: string;
  /**
   * @description The unique identifier of the user who is a member of the team.
   * @example "m1n2o3p4-q5r6-7890-1234-567890abcdef"
   */
  userId!: string;
  /**
   * @description The role of the user within the team.
   * @example "member"
   */
  role!: string;
}

/* --------------------------------- Leave Request -------------------------------- */

/**
 * @description Data transfer object for creating a new leave request.
 */
export class CreateLeaveRequestDto {
  /**
   * @description The unique identifier of the user requesting leave.
   * @example "u1v2w3x4-y5z6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  /**
   * @description The start date of the leave request in ISO 8601 format.
   * @example "2024-01-01T00:00:00Z"
   */
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  /**
   * @description The end date of the leave request in ISO 8601 format.
   * @example "2024-01-05T00:00:00Z"
   */
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  /**
   * @description The type of leave being requested (e.g., "vacation", "sick_leave").
   * @example "vacation"
   */
  @IsEnum(LeaveType)
  @IsNotEmpty()
  leaveType!: LeaveType;

  /**
   * @description Optional: A reason or description for the leave request.
   * @example "Annual vacation trip"
   */
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * @description Data transfer object for updating an existing leave request.
 */
export class UpdateLeaveRequestDto {
  /**
   * @description Optional: The updated status of the leave request (e.g., "approved", "rejected").
   * @example "approved"
   */
  @IsEnum(LeaveRequestStatus)
  @IsOptional()
  status?: LeaveRequestStatus;

  /**
   * @description Optional: A reason for rejecting the leave request.
   * @example "Insufficient coverage"
   */
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

/**
 * @description Data transfer object for a leave request response.
 */
export class LeaveRequestResponseDto {
  /**
   * @description The unique identifier of the leave request.
   * @example "l1e2a3v4-e5r6-7890-1234-567890abcdef"
   */
  id!: string;
  /**
   * @description The unique identifier of the user who requested leave.
   * @example "u1v2w3x4-y5z6-7890-1234-567890abcdef"
   */
  userId!: string;
  /**
   * @description The start date of the leave request.
   * @example "2024-01-01T00:00:00.000Z"
   */
  startDate!: Date;
  /**
   * @description The end date of the leave request.
   * @example "2024-01-05T00:00:00.000Z"
   */
  endDate!: Date;
  /**
   * @description The type of leave being requested.
   * @example "vacation"
   */
  leaveType!: LeaveType;
  /**
   * @description The current status of the leave request.
   * @example "pending"
   */
  status!: LeaveRequestStatus;
  /**
   * @description Optional: A reason or description for the leave request.
   * @example "Annual vacation trip"
   */
  reason?: string;
  /**
   * @description Optional: A reason for rejecting the leave request.
   * @example "Insufficient coverage"
   */
  rejectionReason?: string;
}
