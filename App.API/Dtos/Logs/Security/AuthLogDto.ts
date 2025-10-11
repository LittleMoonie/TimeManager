import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
} from "class-validator";
import { AuthLogAction } from "../../../Entities/Logs/Security/AuthLog";

export interface IStringToStringDictionary {
  [key: string]: string;
}

export class CreateAuthLogDto {
  @IsEnum(AuthLogAction)
  @IsNotEmpty()
  action!: AuthLogAction;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsOptional()
  metadata?: IStringToStringDictionary;
}

export class AuthLogResponseDto {
  id!: string;
  action!: AuthLogAction;
  userId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: IStringToStringDictionary;
  createdAt!: Date;
}
