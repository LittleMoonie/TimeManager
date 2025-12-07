import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

import { WebhookLogType } from '../../../Entities/Logs/Webhooks/WebhookLog';

export interface IStringToStringDictionary {
  [key: string]: string;
}

export class CreateWebhookLogDto {
  @IsEnum(WebhookLogType)
  @IsNotEmpty()
  type!: WebhookLogType;

  @IsString()
  @IsNotEmpty()
  event!: string;

  @IsOptional()
  payload?: IStringToStringDictionary;

  @IsOptional()
  response?: IStringToStringDictionary;

  @IsNumber()
  @IsOptional()
  statusCode?: number;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  error?: string;
}

export class WebhookLogResponseDto {
  id!: string;
  type!: WebhookLogType;
  event!: string;
  payload?: IStringToStringDictionary;
  response?: IStringToStringDictionary;
  statusCode?: number;
  url?: string;
  error?: string;
  createdAt!: Date;
}
