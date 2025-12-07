import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

import { LogLevel } from '../../../Entities/Logs/System/SystemLog';

export interface IStringToStringDictionary {
  [key: string]: string;
}

export class CreateSystemLogDto {
  @IsEnum(LogLevel)
  @IsNotEmpty()
  level!: LogLevel;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  metadata?: IStringToStringDictionary;
}

export class SystemLogResponseDto {
  id!: string;
  level!: LogLevel;
  message!: string;
  metadata?: IStringToStringDictionary;
  createdAt!: Date;
}
