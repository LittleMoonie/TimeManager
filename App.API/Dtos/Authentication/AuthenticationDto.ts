import { UserResponseDto } from "../Users/UserResponseDto";
import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsUUID,
  Matches,
} from "class-validator";

/** @summary Authentication response (login/register/refresh). */
export class AuthResponseDto {
  /** @description JWT access token. */
  token!: string;

  /** @description Authenticated user profile. */
  user!: UserResponseDto;
}

/** @summary Login request. */
export class LoginDto {
  @IsEmail()
  public email!: string;

  @IsString()
  @MinLength(6)
  public password!: string;
}

/** @summary Registration request. */
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
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: "phoneNumber must be E.164" })
  public phoneNumber!: string;
}
