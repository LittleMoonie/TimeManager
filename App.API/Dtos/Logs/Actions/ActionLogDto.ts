import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
} from "class-validator";
import { ActionLogType } from "../../../Entities/Logs/Actions/ActionLog";

export interface IStringToStringDictionary {
  [key: string]: string;
}

export class CreateActionLogDto {
  @IsEnum(ActionLogType)
  @IsNotEmpty()
  actionType!: ActionLogType;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsOptional()
  metadata?: IStringToStringDictionary;
}

export class ActionLogResponseDto {
  id!: string;
  actionType!: ActionLogType;
  description!: string;
  userId?: string;
  metadata?: IStringToStringDictionary;
  createdAt!: Date;
}
