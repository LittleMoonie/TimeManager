import { UserResponseDto } from "../../Dtos/Users/UserResponseDto";
import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsUUID,
  Matches,
} from "class-validator";

/**
 * @description Data transfer object for authentication responses, used after successful login, registration, or token refresh.
 */
export class AuthResponseDto {
  /**
   * @description The JSON Web Token (JWT) used for authenticating subsequent API requests.
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  token!: string;

  /**
   * @description The refresh token used for refreshing the JWT.
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  refreshToken!: string;

  /**
   * @description The profile of the authenticated user.
   */
  user!: UserResponseDto;
}

/**
 * @description Data transfer object for user login requests.
 */
export class LoginDto {
  /**
   * @description The email address of the user attempting to log in.
   * @example "user@example.com"
   */
  @IsEmail()
  public email!: string;

  /**
   * @description The password of the user attempting to log in. Must be at least 6 characters long.
   * @example "mysecretpassword"
   */
  @IsString()
  @MinLength(6)
  public password!: string;
}

/**
 * @description Data transfer object for user registration requests.
 */
export class RegisterDto {
  /**
   * @description The email address for the new user. Must be a valid email format.
   * @example "newuser@example.com"
   */
  @IsEmail()
  public email!: string;

  /**
   * @description The password for the new user. Must be at least 6 characters long.
   * @example "securepassword123"
   */
  @IsString()
  @MinLength(6)
  public password!: string;

  /**
   * @description The first name of the new user.
   * @example "Alice"
   */
  @IsString()
  @IsNotEmpty()
  public firstName!: string;

  /**
   * @description The last name of the new user.
   * @example "Smith"
   */
  @IsString()
  @IsNotEmpty()
  public lastName!: string;

  /**
   * @description The unique identifier of the company the new user will belong to.
   * @example "c1o2m3p4-a5n6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsNotEmpty()
  public companyId!: string;

  /**
   * @description The unique identifier of the role to assign to the new user.
   * @example "r1o2l3e4-i5d6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsNotEmpty()
  public roleId!: string;

  /**
   * @description The unique identifier of the initial status for the new user.
   * @example "s1t2a3t4-u5s6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsNotEmpty()
  public statusId!: string;

  /**
   * @description The phone number of the new user in E.164 format. Must be a valid E.164 phone number.
   * @example "+15551234567"
   */
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: "phoneNumber must be E.164" })
  public phoneNumber!: string;
}
