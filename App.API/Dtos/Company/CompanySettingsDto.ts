import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
} from "class-validator";
import { ApproverPolicy } from "../../Entities/Companies/CompanySettings";

/**
 * @summary Data transfer object for updating company settings.
 */
export class UpdateCompanySettingsDto {
  /**
   * @description Optional: The timezone of the company.
   * @example "America/New_York"
   */
  @IsString()
  @IsOptional()
  timezone?: string;

  /**
   * @description Optional: Defines the company's work week (e.g., days and hours).
   * @example { "monday": [9, 17], "tuesday": [9, 17] }
   */
  @IsOptional()
  workWeek?: Record<string, number[]>;

  /**
   * @description Optional: The holiday calendar to be used by the company.
   * @example "US Federal Holidays"
   */
  @IsString()
  @IsOptional()
  holidayCalendar?: string;

  /**
   * @description Optional: The policy for timesheet approvals.
   * @example "Manager"
   */
  @IsEnum(ApproverPolicy)
  @IsOptional()
  timesheetApproverPolicy?: ApproverPolicy;

  /**
   * @description Optional: An array of allowed email domains for company users.
   * @example ["example.com", "another.com"]
   */
  @IsArray()
  @IsOptional()
  allowedEmailDomains?: string[];

  /**
   * @description Optional: Indicates if company email is required for user registration.
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  requireCompanyEmail?: boolean;
}

/**
 * @summary Data transfer object for a company settings response.
 */
export class CompanySettingsResponseDto {
  /**
   * @description The unique identifier of the company.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  companyId!: string;
  /**
   * @description The timezone of the company.
   * @example "America/New_York"
   */
  timezone!: string;
  /**
   * @description Defines the company's work week (e.g., days and hours).
   * @example { "monday": [9, 17], "tuesday": [9, 17] }
   */
  workWeek!: Record<string, number[]>;
  /**
   * @description Optional: The holiday calendar used by the company.
   * @example "US Federal Holidays"
   */
  holidayCalendar?: string;
  /**
   * @description The policy for timesheet approvals.
   * @example "Manager"
   */
  timesheetApproverPolicy!: ApproverPolicy;
  /**
   * @description Optional: An array of allowed email domains for company users.
   * @example ["example.com", "another.com"]
   */
  allowedEmailDomains?: string[];
  /**
   * @description Indicates if company email is required for user registration.
   * @example true
   */
  requireCompanyEmail!: boolean;
}
