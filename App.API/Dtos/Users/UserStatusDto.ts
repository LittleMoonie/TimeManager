import { IsNotEmpty, IsString, IsOptional, IsBoolean } from "class-validator";

export class CreateUserStatusDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  canLogin?: boolean;

  @IsBoolean()
  @IsOptional()
  isTerminal?: boolean;
}

export class UpdateUserStatusDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  canLogin?: boolean;

  @IsBoolean()
  @IsOptional()
  isTerminal?: boolean;
}

export class UserStatusResponseDto {
  id!: string;
  code!: string;
  name!: string;
  description?: string;
  canLogin!: boolean;
  isTerminal!: boolean;
}
