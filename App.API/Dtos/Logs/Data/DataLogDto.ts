import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
} from "class-validator";
import { DataLogAction } from "../../../Entities/Logs/Data/DataLog";

export interface IStringToStringDictionary {
  [key: string]: string;
}

export class CreateDataLogDto {
  @IsEnum(DataLogAction)
  @IsNotEmpty()
  action!: DataLogAction;

  @IsString()
  @IsNotEmpty()
  entityType!: string;

  @IsUUID()
  @IsNotEmpty()
  entityId!: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsOptional()
  oldValue?: IStringToStringDictionary;

  @IsOptional()
  newValue?: IStringToStringDictionary;

  @IsString()
  @IsOptional()
  description?: string;
}

export class DataLogResponseDto {
  id!: string;
  action!: DataLogAction;
  entityType!: string;
  entityId!: string;
  userId?: string;
  oldValue?: IStringToStringDictionary;
  newValue?: IStringToStringDictionary;
  description?: string;
  createdAt!: Date;
}
