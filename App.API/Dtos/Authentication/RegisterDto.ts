import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsUUID,
} from "class-validator";

export class RegisterDto {
  @IsEmail()
  public email!: string;

  @IsString()
  @MinLength(6)
  public password!: string;

  @IsString()
  @IsNotEmpty()
  public firstName!: string;

  @IsString()
  @IsNotEmpty()
  public lastName!: string;

  @IsUUID()
  @IsNotEmpty()
  public companyId!: string;

  @IsUUID()
  @IsNotEmpty()
  public roleId!: string;

  @IsUUID()
  @IsNotEmpty()
  public statusId!: string;

  @IsString()
  @IsNotEmpty()
  public phoneNumber!: string;
}
