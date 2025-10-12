import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsUUID,
  IsOptional,
} from "class-validator";

/**
 * @summary Data transfer object for updating an existing user.
 */
export class UpdateUserDto {
  /**
   * @description Optional: The user's updated email address.
   * @example "jane.doe@example.com"
   */
  @IsEmail()
  @IsOptional()
  public email?: string;

  /**
   * @description Optional: The user's updated first name.
   * @example "Jane"
   */
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public firstName?: string;

  /**
   * @description Optional: The user's updated last name.
   * @example "Doe"
   */
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public lastName?: string;

  /**
   * @description Optional: The user's updated password (minimum 6 characters).
   * @example "newpassword123"
   */
  @IsString()
  @MinLength(6)
  @IsOptional()
  public password?: string;

  /**
   * @description Optional: The ID of the new role for the user.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  @IsUUID()
  @IsOptional()
  public roleId?: string;

  /**
   * @description Optional: The ID of the new status for the user.
   * @example "1a2b3c4d-5e6f-7890-abcd-ef1234567890"
   */
  @IsUUID()
  @IsOptional()
  public statusId?: string;

  /**
   * @description Optional: The ID of the new company for the user.
   * @example "2b3c4d5e-6f7a-8901-bcde-f1234567890a"
   */
  @IsUUID()
  @IsOptional()
  public companyId?: string;
}
