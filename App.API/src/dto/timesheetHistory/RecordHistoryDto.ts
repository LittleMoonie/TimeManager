import { IsEnum, IsISO8601, IsJSON, IsOptional, IsString, IsUUID } from 'class-validator';
import { TimesheetHistoryAction, TimesheetHistoryEntityType } from '../../models/timesheetHistory';
import { TimesheetHistoryEntityTypeEnum } from '../../models/enums/timesheetHistory/TimesheetHistoryEntityTypeEnum';
import { TimesheetHistoryActionEnum } from '../../models/enums/timesheetHistory/TimesheetHistoryActionEnum';

export class RecordHistoryDto {
  @IsEnum(TimesheetHistoryEntityTypeEnum)
  entityType!: TimesheetHistoryEntityType;

  @IsUUID()
  entityId!: string;

  @IsEnum(TimesheetHistoryActionEnum)
  action!: TimesheetHistoryAction;

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
  diff?: object;

  @IsOptional()
  @IsJSON()
  metadata?: object;

  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  @IsOptional()
  @IsString()
  hash?: string;
}
