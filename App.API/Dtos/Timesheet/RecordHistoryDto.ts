import {
  IsEnum,
  IsISO8601,
  IsJSON,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { DataLogAction } from "../../Entities/Logs/Data/DataLog";

export class RecordHistoryDto {
  @IsEnum(DataLogAction)
  entityType!: DataLogAction;

  @IsUUID()
  entityId!: string;

  @IsEnum(DataLogAction)
  action!: DataLogAction;

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
  diff?: Record<string, string>;

  @IsOptional()
  @IsJSON()
  metadata?: Record<string, string>;

  @IsOptional()
  @IsISO8601()
  createdAt?: string;

  @IsOptional()
  @IsString()
  hash?: string;
}
