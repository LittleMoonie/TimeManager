import { IsNotEmpty, IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';

import { ErrorLogLevel } from '../../../Entities/Logs/Errors/ErrorLog';

export interface IStringToStringDictionary {
  [key: string]: string;
}

export class CreateErrorLogDto {
  @IsEnum(ErrorLogLevel)
  @IsNotEmpty()
  level!: ErrorLogLevel;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  stack?: string;

  @IsOptional()
  metadata?: IStringToStringDictionary;
}

export class ErrorLogResponseDto {
  id!: string;
  level!: ErrorLogLevel;
  message!: string;
  userId?: string;
  stack?: string;
  metadata?: IStringToStringDictionary;
  createdAt!: Date;
}
