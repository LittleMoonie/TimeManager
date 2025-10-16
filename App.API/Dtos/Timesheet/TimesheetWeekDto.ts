import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { TimesheetStatus } from '../../Entities/Timesheets/Timesheet';
import {
  TimesheetRowBillableTag,
  TimesheetRowLocation,
  TimesheetRowStatus,
} from '../../Entities/Timesheets/TimesheetRow';

export class TimesheetWeekRowRejectionDto {
  reason?: string;
  actorId?: string;
  actorName?: string;
  occurredAt!: string;
}

export class TimesheetWeekRejectionDto extends TimesheetWeekRowRejectionDto {}

export class TimesheetWeekRowEntryDto {
  /**
   * ISO date string representing the day of the entry.
   */
  @IsString()
  day!: string;

  /**
   * Minutes logged for the day.
   */
  minutes!: number;

  /**
   * Optional notes for the day.
   */
  @IsOptional()
  @IsString()
  note?: string | null;
}

export class TimesheetWeekRowDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @IsNotEmpty()
  activityLabel!: string;

  @IsUUID()
  timeCodeId!: string;

  @IsEnum(TimesheetRowBillableTag)
  billable!: TimesheetRowBillableTag;

  @IsEnum(TimesheetRowLocation)
  location!: TimesheetRowLocation;

  @IsString()
  countryCode!: string;

  @IsOptional()
  @IsString()
  employeeCountryCode?: string | null;

  @IsEnum(TimesheetRowStatus)
  status!: TimesheetRowStatus;

  @IsBoolean()
  locked!: boolean;

  @IsArray()
  entries!: TimesheetWeekRowEntryDto[];

  @IsOptional()
  rejection?: TimesheetWeekRowRejectionDto;
}

export class TimesheetWeekUpsertDto {
  @IsArray()
  rows!: TimesheetWeekRowDto[];
}

export class TimesheetWeekSubmitDto {
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class TimesheetWeekSettingsDto {
  defaultCountryCode?: string;
  defaultLocation?: string;
  maxWeeklyMinutes!: number;
  autoSubmitAt?: string | null;
  officeCountryCodes?: string[];
}

export class TimesheetWeekResponseDto {
  weekStart!: string;
  weekEnd!: string;
  status!: TimesheetStatus;
  rows!: TimesheetWeekRowDto[];
  settings!: TimesheetWeekSettingsDto;
  rejection?: TimesheetWeekRejectionDto;
}
