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
} from 'class-validator';
import { ApprovalStatus } from '../../Entities/Timesheets/TimesheetApproval';
import { WorkMode } from '../../Entities/Timesheets/TimesheetEntry';

/* --------------------------------- ActionCode --------------------------------- */

/**
 * @description Data transfer object for creating a new action code.
 */
export class CreateActionCodeDto {
  /**
   * @description The name of the action code.
   * @example "Development"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * @description The unique code for the action code.
   * @example "DEV"
   */
  @IsString()
  @IsNotEmpty()
  code!: string;

  /**
   * @description Optional: A color associated with the action code, in hexadecimal format (e.g., #RRGGBB).
   * @example "#FF5733"
   */
  @IsString()
  @IsOptional()
  color?: string;
}

/**
 * @description Data transfer object for updating an existing action code.
 */
export class UpdateActionCodeDto {
  /**
   * @description The updated name of the action code.
   * @example "Bug Fixing"
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * @description The updated unique code for the action code.
   * @example "BUG"
   */
  @IsString()
  @IsOptional()
  code?: string;

  /**
   * @description Optional: A color associated with the action code, in hexadecimal format (e.g., #RRGGBB).
   * @example "#FF5733"
   */
  @IsString()
  @IsOptional()
  color?: string;
}

/**
 * @description Data transfer object for an action code response.
 */
export class ActionCodeResponseDto {
  /**
   * @description The unique identifier of the action code.
   * @example "a1c2t3i4-o5n6-7890-1234-567890abcdef"
   */
  id!: string;
  /**
   * @description A unique short code for the action (e.g., "DEV", "MEETING").
   * @example "DEV"
   */
  code!: string;
  /**
   * @description The display name of the action code (e.g., "Development", "Team Meeting").
   * @example "Development"
   */
  name!: string;
  /**
   * @description The type of the action code, indicating if it's billable or non-billable.
   * @example "billable"
   */
  type!: string;
  /**
   * @description Indicates if the action code is currently active.
   * @example true
   */
  active!: boolean;
  /**
   * @description A color associated with the action code, in hexadecimal format (e.g., #RRGGBB).
   * @example "#FF5733"
   */
  color?: string;
}

/* -------------------------------- Timesheet(s) -------------------------------- */

/**
 * @description Data transfer object for creating a new timesheet.
 */
export class CreateTimesheetDto {
  /**
   * @description The start date of the timesheet period in ISO 8601 format.
   * @example "2024-01-01"
   */
  @IsDateString()
  @IsNotEmpty()
  periodStart!: string;

  /**
   * @description The end date of the timesheet period in ISO 8601 format.
   * @example "2024-01-07"
   */
  @IsDateString()
  @IsNotEmpty()
  periodEnd!: string;

  /**
   * @description Optional: Any notes related to the timesheet.
   * @example "Weekly report for project X"
   */
  @IsString()
  @IsOptional()
  notes?: string;
}

/* ------------------------------ Timesheet Entry ------------------------------- */

/**
 * @description Data transfer object for creating a new timesheet entry.
 */
export class CreateTimesheetEntryDto {
  /**
   * @description The unique identifier of the action code associated with this entry.
   * @example "a1c2t3i4-o5n6-7890-1234-567890abcdef"
   */
  @IsString()
  @IsNotEmpty()
  actionCodeId!: string;

  /**
   * @description The date of the timesheet entry in ISO 8601 format.
   * @example "2024-01-01"
   */
  @IsDateString()
  @IsNotEmpty()
  day!: string;

  /**
   * @description The duration of the entry in minutes (0-1440).
   * @example 480
   */
  @IsInt()
  @Min(0)
  @Max(1440)
  durationMin!: number;

  /**
   * @description The country code (ISO 3166-1 alpha-2) where the work was performed.
   * @example "US"
   */
  @IsString()
  @IsNotEmpty()
  country!: string;

  /**
   * @description Optional: The work mode for the entry (e.g., "office", "remote", "hybrid").
   * @example "office"
   */
  @IsOptional()
  @IsIn(['office', 'remote', 'hybrid'])
  workMode?: WorkMode;

  /**
   * @description Optional: Any notes related to this specific entry.
   * @example "Worked on feature Y"
   */
  @IsString()
  @IsOptional()
  note?: string;
}

/**
 * @description Data transfer object for updating an existing timesheet entry.
 */
export class UpdateTimesheetEntryDto {
  /**
   * @description Optional: The updated unique identifier of the action code.
   * @example "b1u2g3f4-i5x6-7890-1234-567890abcdef"
   */
  @IsString()
  @IsOptional()
  actionCodeId?: string;

  /**
   * @description Optional: The updated date of the timesheet entry.
   * @example "2024-01-02"
   */
  @IsDateString()
  @IsOptional()
  day?: string;

  /**
   * @description Optional: The updated duration of the entry in minutes.
   * @example 540
   */
  @IsInt()
  @Min(0)
  @Max(1440)
  @IsOptional()
  durationMin?: number;

  /**
   * @description Optional: The updated country code where the work was performed.
   * @example "CA"
   */
  @IsString()
  @IsOptional()
  country?: string;

  /**
   * @description Optional: The updated work mode for the entry.
   * @example "remote"
   */
  @IsOptional()
  @IsIn(['office', 'remote', 'hybrid'])
  workMode?: WorkMode;

  /**
   * @description Optional: Any updated notes related to this specific entry.
   * @example "Continued work on feature Y"
   */
  @IsString()
  @IsOptional()
  note?: string;
}

/**
 * @description Data transfer object for a timesheet entry response.
 */
export class TimesheetEntryResponseDto {
  /**
   * @description The unique identifier of the timesheet entry.
   * @example "e1n2t3r4-y5i6d7-8901-2345-67890abcdef"
   */
  id!: string;
  /**
   * @description The unique identifier of the action code associated with this entry.
   * @example "a1c2t3i4-o5n6-7890-1234-567890abcdef"
   */
  actionCodeId!: string;
  /**
   * @description The date of the timesheet entry.
   * @example "2024-01-01"
   */
  day!: string;
  /**
   * @description The duration of the entry in minutes.
   * @example 480
   */
  durationMin!: number;
  /**
   * @description The country code where the work was performed.
   * @example "US"
   */
  country!: string;
  /**
   * @description The work mode for the entry.
   * @example "office"
   */
  workMode!: WorkMode;
  /**
   * @description Optional: Any notes related to this specific entry.
   * @example "Worked on feature Y"
   */
  note?: string;
}

/**
 * @description Data transfer object for a timesheet response.
 */
export class TimesheetResponseDto {
  /**
   * @description The unique identifier of the timesheet.
   * @example "t1i2m3e4-s5h6e7e8-9012-3456-7890abcdef"
   */
  id!: string;
  /**
   * @description The unique identifier of the user who owns this timesheet.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  userId!: string;
  /**
   * @description The start date of the timesheet period in ISO date format (YYYY-MM-DD).
   * @example "2024-01-01"
   */
  periodStart!: string;
  /**
   * @description The end date of the timesheet period in ISO date format (YYYY-MM-DD).
   * @example "2024-01-07"
   */
  periodEnd!: string;
  /**
   * @description The current status of the timesheet.
   * @example "DRAFT"
   */
  status!: string;
  /**
   * @description The total duration in minutes of all entries in this timesheet.
   * @example 480
   */
  totalMinutes!: number;
  /**
   * @description Optional: Any general notes or comments for the timesheet.
   * @example "Weekly report for Project Alpha"
   */
  notes?: string;
  /**
   * @description List of individual timesheet entries belonging to this timesheet.
   */
  entries?: TimesheetEntryResponseDto[];
}

/**
 * @description Data transfer object for updating an existing timesheet.
 */
export class UpdateTimesheetDto {
  /**
   * @description Optional: The updated start date of the timesheet period in ISO 8601 format.
   * @example "2024-01-01"
   */
  @IsDateString()
  @IsOptional()
  periodStart?: string;

  /**
   * @description Optional: The updated end date of the timesheet period in ISO 8601 format.
   * @example "2024-01-07"
   */
  @IsDateString()
  @IsOptional()
  periodEnd?: string;

  /**
   * @description Optional: Any updated notes related to the timesheet.
   * @example "Updated weekly report for project X"
   */
  @IsString()
  @IsOptional()
  notes?: string;
}

/* ---------------------------- Timesheet Approvals ----------------------------- */

/**
 * @description Data transfer object for creating a new timesheet approval.
 */
export class CreateTimesheetApprovalDto {
  /**
   * @description The unique identifier of the timesheet to be approved.
   * @example "t1i2m3e4-s5h6e7e8-9012-3456-7890abcdef"
   */
  @IsUUID()
  @IsNotEmpty()
  timesheetId!: string;

  /**
   * @description The unique identifier of the approver.
   * @example "a1p2p3r4-o5v6e7r8-9012-3456-7890abcdef"
   */
  @IsUUID()
  @IsNotEmpty()
  approverId!: string;
}

/**
 * @description Data transfer object for updating an existing timesheet approval.
 */
export class UpdateTimesheetApprovalDto {
  /**
   * @description The updated status of the timesheet approval (e.g., "approved", "rejected").
   * @example "approved"
   */
  @IsEnum(ApprovalStatus)
  @IsNotEmpty()
  status!: ApprovalStatus;

  /**
   * @description Optional: A reason for the approval status change (e.g., rejection reason).
   * @example "Approved as submitted"
   */
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * @description Data transfer object for a timesheet approval response.
 */
export class TimesheetApprovalResponseDto {
  /**
   * @description The unique identifier of the timesheet approval.
   * @example "a1p2p3r4-o5v6e7r8-9012-3456-7890abcdef"
   */
  id!: string;
  /**
   * @description The unique identifier of the timesheet being approved.
   * @example "t1i2m3e4-s5h6e7e8-9012-3456-7890abcdef"
   */
  timesheetId!: string;
  /**
   * @description The unique identifier of the approver.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  approverId!: string;
  /**
   * @description The current status of the timesheet approval.
   * @example "approved"
   */
  status!: ApprovalStatus;
  /**
   * @description Optional: A reason for the approval status change.
   * @example "Approved as submitted"
   */
  reason?: string;
  /**
   * @description Optional: The date and time when the approval decision was made.
   * @example "2024-01-08T10:00:00.000Z"
   */
  decidedAt?: Date;
}

/* ------------------------------- Record History ------------------------------- */

const TARGET_TYPES = ['Timesheet', 'TimesheetEntry', 'TimesheetApproval', 'ActionCode'] as const;
type TargetType = (typeof TARGET_TYPES)[number];

const ACTIONS = ['created', 'updated', 'submitted', 'approved', 'rejected', 'deleted'] as const;
type ActionType = (typeof ACTIONS)[number];

/**
 * @description Data transfer object for recording history events related to timesheet entities.
 */
export class RecordHistoryDto {
  /**
   * @description The type of the target entity (e.g., "Timesheet", "TimesheetEntry").
   * @example "Timesheet"
   */
  @IsIn(TARGET_TYPES as unknown as string[])
  targetType!: TargetType;

  /**
   * @description The unique identifier of the target entity.
   * @example "t1i2m3e4-s5h6e7e8-9012-3456-7890abcdef"
   */
  @IsUUID()
  targetId!: string;

  /**
   * @description The action performed on the target entity (e.g., "created", "submitted").
   * @example "created"
   */
  @IsIn(ACTIONS as unknown as string[])
  action!: ActionType;

  /**
   * @description The unique identifier of the user who initiated the action.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @IsUUID()
  userId!: string;

  /**
   * @description Optional: The unique identifier of the actor user if different from the userId.
   * @example "a1c2t3o4-r5u6s7e8-9012-3456-7890abcdef"
   */
  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  /**
   * @description Optional: A reason for the action.
   * @example "Initial creation"
   */
  @IsOptional()
  @IsString()
  reason?: string;

  /**
   * @description Optional: A JSON object representing the difference in state before and after the action.
   * @example { "status": "DRAFT", "newStatus": "SUBMITTED" }
   */
  @IsOptional()
  @IsObject()
  diff?: Record<string, string>;

  /**
   * @description Optional: Additional metadata related to the action.
   * @example { "ipAddress": "192.168.1.1" }
   */
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;

  /**
   * @description Optional: The ISO 8601 timestamp when the action occurred.
   * @example "2024-01-01T10:00:00Z"
   */
  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  /**
   * @description Optional: A hash of the record for integrity checking.
   * @example "somehashvalue"
   */
  @IsOptional()
  @IsString()
  hash?: string;
}
