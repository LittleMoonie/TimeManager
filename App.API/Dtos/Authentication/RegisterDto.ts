import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsUUID,
} from "class-validator";

/**
 * @summary Data transfer object for user registration.
 */
export class RegisterDto {
  /**
   * @description The user's email address.
   * @example "john.doe@example.com"
   */
  @IsEmail()
  public email!: string;

  /**
   * @description The user's password (minimum 6 characters).
   * @example "password123"
   */
  @IsString()
  @MinLength(6)
  public password!: string;

  /**
   * @description The user's first name.
   * @example "John"
   */
  @IsString()
  @IsNotEmpty()
  public firstName!: string;

  /**
   * @description The user's last name.
   * @example "Doe"
   */
  @IsString()
  @IsNotEmpty()
  public lastName!: string;

  /**
   * @description The ID of the company the user belongs to.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsNotEmpty()
  public companyId!: string;

  /**
   * @description The ID of the role assigned to the user.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  @IsUUID()
  @IsNotEmpty()
  public roleId!: string;

  /**
   * @description The ID of the user's status.
   * @example "1a2b3c4d-5e6f-7890-abcd-ef1234567890"
   */
  @IsUUID()
  @IsNotEmpty()
  public statusId!: string;

  /**
   * @description The user's phone number.
   * @example "+15551234567"
   */
  @IsString()
  @IsNotEmpty()
  public phoneNumber!: string;
}
