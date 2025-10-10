import { IsEnum, IsString, IsUUID, IsJSON, IsISO8601, IsNumber } from "class-validator";
import { IsOptional } from "class-validator";
import { TimesheetHistoryEntityTypeEnum } from "../../models/enums/timesheetHistory/TimesheetHistoryEntityTypeEnum";
import { TimesheetHistoryActionEnum } from "../../models/enums/timesheetHistory/TimesheetHistoryActionEnum";

export interface IRecordOfAny {
    [key: string]: any;
  }

export class TimesheetHistoryDto {
  @IsEnum(TimesheetHistoryEntityTypeEnum)
  entityType!: TimesheetHistoryEntityTypeEnum;

  @IsUUID()
  entityId!: string;

  @IsEnum(TimesheetHistoryActionEnum)
  action!: TimesheetHistoryActionEnum;

  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsJSON()
  diff?: IRecordOfAny;

  @IsOptional()
  @IsISO8601()
  startedAt?: string;

  @IsOptional()
  @IsISO8601()
  endedAt?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}