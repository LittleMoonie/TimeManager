import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsUUID,
  IsOptional,
} from "class-validator";

/**
 * @summary Data transfer object for creating a new user.
 */
export class CreateUserDto {
  /**
   * @description The user's email address.
   * @example "john.doe@example.com"
   */
  @IsEmail()
  public email!: string;

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
   * @description The user's password (minimum 6 characters).
   * @example "password123"
   */
  @IsString()
  @MinLength(6)
  public password!: string;

  /**
   * @description The ID of the role assigned to the user.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  @IsUUID()
  public roleId!: string;

  /**
   * @description Optional: The ID of the company the user belongs to.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsString()
  @IsOptional()
  public companyId?: string;
}
