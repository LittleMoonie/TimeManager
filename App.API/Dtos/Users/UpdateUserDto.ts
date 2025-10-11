import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsUUID,
  IsOptional,
} from "class-validator";

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  public email?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public firstName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public lastName?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  public password?: string;

  @IsUUID()
  @IsOptional()
  public roleId?: string;

  @IsUUID()
  @IsOptional()
  public statusId?: string;

  @IsUUID()
  @IsOptional()
  public companyId?: string;
}
