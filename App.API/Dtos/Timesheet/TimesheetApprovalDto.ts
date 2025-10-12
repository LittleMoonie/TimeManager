import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
} from "class-validator";
import { ApprovalStatus } from "../../Entities/Timesheets/TimesheetApproval";

/**
 * @summary Data transfer object for creating a new timesheet approval.
 */
export class CreateTimesheetApprovalDto {
  /**
   * @description The ID of the timesheet to be approved.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsNotEmpty()
  timesheetId!: string;

  /**
   * @description The ID of the user who is approving the timesheet.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  @IsUUID()
  @IsNotEmpty()
  approverId!: string;
}

/**
 * @summary Data transfer object for updating an existing timesheet approval.
 */
export class UpdateTimesheetApprovalDto {
  /**
   * @description The new status of the timesheet approval.
   * @example "Approved"
   */
  @IsEnum(ApprovalStatus)
  @IsNotEmpty()
  status!: ApprovalStatus;

  /**
   * @description Optional: A reason for the approval status change (e.g., rejection reason).
   * @example "Timesheet rejected due to missing entries."
   */
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * @summary Data transfer object for a timesheet approval response.
 */
export class TimesheetApprovalResponseDto {
  /**
   * @description The unique identifier of the timesheet approval.
   * @example "1a2b3c4d-5e6f-7890-abcd-ef1234567890"
   */
  id!: string;
  /**
   * @description The ID of the timesheet associated with this approval.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  timesheetId!: string;
  /**
   * @description The ID of the user who approved/rejected the timesheet.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  approverId!: string;
  /**
   * @description The current status of the timesheet approval.
   * @example "Approved"
   */
  status!: ApprovalStatus;
  /**
   * @description Optional: A reason for the approval status (e.g., rejection reason).
   * @example "Approved as submitted."
   */
  reason?: string;
  /**
   * @description Optional: The date and time when the approval decision was made.
   * @example "2023-10-27T10:00:00Z"
   */
  decidedAt?: Date;
}
