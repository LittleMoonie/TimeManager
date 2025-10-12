import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
} from "class-validator";
import {
  LeaveRequestStatus,
  LeaveType,
} from "../../Entities/Companies/LeaveRequest";

/**
 * @summary Data transfer object for creating a new leave request.
 */
export class CreateLeaveRequestDto {
  /**
   * @description The ID of the user requesting leave.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsString()
  @IsNotEmpty()
  userId!: string;

  /**
   * @description The start date of the leave request (ISO 8601 format).
   * @example "2023-11-01T09:00:00Z"
   */
  @IsDateString()
  @IsNotEmpty()
  startDate!: Date;

  /**
   * @description The end date of the leave request (ISO 8601 format).
   * @example "2023-11-05T17:00:00Z"
   */
  @IsDateString()
  @IsNotEmpty()
  endDate!: Date;

  /**
   * @description The type of leave being requested.
   * @example "Vacation"
   */
  @IsEnum(LeaveType)
  @IsNotEmpty()
  leaveType!: LeaveType;

  /**
   * @description Optional: The reason for the leave request.
   * @example "Annual vacation trip."
   */
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * @summary Data transfer object for updating an existing leave request.
 */
export class UpdateLeaveRequestDto {
  /**
   * @description Optional: The new status of the leave request.
   * @example "Approved"
   */
  @IsEnum(LeaveRequestStatus)
  @IsOptional()
  status?: LeaveRequestStatus;

  /**
   * @description Optional: The reason for rejecting the leave request, if applicable.
   * @example "Insufficient coverage during requested period."
   */
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

/**
 * @summary Data transfer object for a leave request response.
 */
export class LeaveRequestResponseDto {
  /**
   * @description The unique identifier of the leave request.
   * @example "1a2b3c4d-5e6f-7890-abcd-ef1234567890"
   */
  id!: string;
  /**
   * @description The ID of the user who requested leave.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  userId!: string;
  /**
   * @description The start date of the leave request.
   * @example "2023-11-01T09:00:00Z"
   */
  startDate!: Date;
  /**
   * @description The end date of the leave request.
   * @example "2023-11-05T17:00:00Z"
   */
  endDate!: Date;
  /**
   * @description The type of leave requested.
   * @example "Vacation"
   */
  leaveType!: LeaveType;
  /**
   * @description The current status of the leave request.
   * @example "Pending"
   */
  status!: LeaveRequestStatus;
  /**
   * @description Optional: The reason for the leave request.
   * @example "Annual vacation trip."
   */
  reason?: string;
  /**
   * @description Optional: The reason for rejecting the leave request, if applicable.
   * @example "Insufficient coverage during requested period."
   */
  rejectionReason?: string;
}
