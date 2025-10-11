import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsUUID,
  IsOptional,
} from "class-validator";

export class CreateUserDto {
  @IsEmail()
  public email!: string;

  @IsString()
  @IsNotEmpty()
  public firstName!: string;

  @IsString()
  @IsNotEmpty()
  public lastName!: string;

  @IsString()
  @MinLength(6)
  public password!: string;

  @IsUUID()
  public roleId!: string;

  @IsString()
  @IsOptional()
  public companyId?: string;
}
