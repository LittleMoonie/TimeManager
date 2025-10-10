import { IsEnum, IsISO8601, IsJSON, IsOptional, IsString, IsUUID } from 'class-validator';
import { TimesheetHistoryEntityTypeEnum } from '../../models/enums/timesheetHistory/TimesheetHistoryEntityTypeEnum';
import { TimesheetHistoryActionEnum } from '../../models/enums/timesheetHistory/TimesheetHistoryActionEnum';

export interface IRecordOfAny {
  [key: string]: any;
}

export class RecordHistoryDto {
  @IsEnum(TimesheetHistoryEntityTypeEnum)
  entityType!: TimesheetHistoryEntityTypeEnum;

  @IsUUID()
  entityId!: string;

  @IsEnum(TimesheetHistoryActionEnum)
  action!: TimesheetHistoryActionEnum;

  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsOptional()
  @IsString()
  fromStatus?: string;

  @IsOptional()
  @IsString()
  toStatus?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsJSON()
  diff?: IRecordOfAny;

  @IsOptional()
  @IsJSON()
  metadata?: IRecordOfAny;

  @IsOptional()
  @IsISO8601()
  createdAt?: string;

  @IsOptional()
  @IsString()
  hash?: string;
}
