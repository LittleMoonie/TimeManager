import { IsNotEmpty, IsString, IsOptional, IsBoolean } from "class-validator";

/**
 * @summary Data transfer object for creating a new user status.
 */
export class CreateUserStatusDto {
  /**
   * @description The unique code for the user status.
   * @example "ACTIVE"
   */
  @IsString()
  @IsNotEmpty()
  code!: string;

  /**
   * @description The display name for the user status.
   * @example "Active"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * @description Optional: A description of the user status.
   * @example "User is currently active and can log in."
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * @description Optional: Indicates if users with this status can log in.
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  canLogin?: boolean;

  /**
   * @description Optional: Indicates if this status is a terminal status (e.g., "terminated").
   * @example false
   */
  @IsBoolean()
  @IsOptional()
  isTerminal?: boolean;
}

/**
 * @summary Data transfer object for updating an existing user status.
 */
export class UpdateUserStatusDto {
  /**
   * @description Optional: The updated unique code for the user status.
   * @example "INACTIVE"
   */
  @IsString()
  @IsOptional()
  code?: string;

  /**
   * @description Optional: The updated display name for the user status.
   * @example "Inactive"
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * @description Optional: An updated description of the user status.
   * @example "User is currently inactive and cannot log in."
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * @description Optional: Indicates if users with this status can log in.
   * @example false
   */
  @IsBoolean()
  @IsOptional()
  canLogin?: boolean;

  /**
   * @description Optional: Indicates if this status is a terminal status.
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  isTerminal?: boolean;
}

/**
 * @summary Data transfer object for a user status response.
 */
export class UserStatusResponseDto {
  /**
   * @description The unique identifier of the user status.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  id!: string;
  /**
   * @description The unique code for the user status.
   * @example "ACTIVE"
   */
  code!: string;
  /**
   * @description The display name for the user status.
   * @example "Active"
   */
  name!: string;
  /**
   * @description Optional: A description of the user status.
   * @example "User is currently active and can log in."
   */
  description?: string;
  /**
   * @description Indicates if users with this status can log in.
   * @example true
   */
  canLogin!: boolean;
  /**
   * @description Indicates if this status is a terminal status.
   * @example false
   */
  isTerminal!: boolean;
}
