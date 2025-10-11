import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
} from "class-validator";
import { ApproverPolicy } from "../../Entities/Companies/CompanySettings";

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
