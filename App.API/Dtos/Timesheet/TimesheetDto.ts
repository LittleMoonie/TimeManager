import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
} from "class-validator";

/**
 * @summary Data transfer object for creating a new timesheet.
 */
export class CreateTimesheetDto {
  /**
   * @description The start date of the timesheet period (ISO 8601 format).
   * @example "2023-10-01T00:00:00Z"
   */
  @IsDateString()
  @IsNotEmpty()
  periodStart!: string;

  /**
   * @description The end date of the timesheet period (ISO 8601 format).
   * @example "2023-10-07T23:59:59Z"
   */
  @IsDateString()
  @IsNotEmpty()
  periodEnd!: string;

  /**
   * @description Optional: Any notes associated with the timesheet.
   * @example "Weekly timesheet for project Alpha."
   */
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * @summary Data transfer object for creating a new timesheet entry.
 */
export class CreateTimesheetEntryDto {
  /**
   * @description The ID of the action code for this entry.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsString()
  @IsNotEmpty()
  actionCodeId!: string;

  /**
   * @description The date of the timesheet entry (ISO 8601 format).
   * @example "2023-10-02T09:00:00Z"
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
   * @description Optional: Any notes for the timesheet entry.
   * @example "Worked on feature X."
   */
  @IsString()
  @IsOptional()
  note?: string;
}

/**
 * @summary Data transfer object for updating an existing timesheet entry.
 */
export class UpdateTimesheetEntryDto {
  /**
   * @description Optional: The updated ID of the action code for this entry.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  @IsString()
  @IsOptional()
  actionCodeId?: string;

  /**
   * @description Optional: The updated date of the timesheet entry (ISO 8601 format).
   * @example "2023-10-03T10:00:00Z"
   */
  @IsDateString()
  @IsOptional()
  day?: string;

  /**
   * @description Optional: The updated duration of the entry in minutes (0-1440).
   * @example 540
   */
  @IsInt()
  @Min(0)
  @Max(1440)
  @IsOptional()
  durationMin?: number;

  /**
   * @description Optional: Any updated notes for the timesheet entry.
   * @example "Completed feature X and started feature Y."
   */
  @IsString()
  @IsOptional()
  note?: string;
}

/**
 * @summary Data transfer object for a timesheet entry response.
 */
export class TimesheetEntryResponseDto {
  /**
   * @description The unique identifier of the timesheet entry.
   * @example "1a2b3c4d-5e6f-7890-abcd-ef1234567890"
   */
  id!: string;
  /**
   * @description The ID of the action code for this entry.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  actionCodeId!: string;
  /**
   * @description The date of the timesheet entry (ISO 8601 format).
   * @example "2023-10-02T09:00:00Z"
   */
  day!: string;
  /**
   * @description The duration of the entry in minutes.
   * @example 480
   */
  durationMin!: number;
  /**
   * @description Optional: Any notes for the timesheet entry.
   * @example "Worked on feature X."
   */
  note?: string;
}
