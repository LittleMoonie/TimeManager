import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsUUID,
  IsOptional,
  Matches,
} from 'class-validator';

import { PaginationQueryDto } from '../../Dtos/Common/PaginationDto';

/** Common E.164 phone regex */
const E164 = /^\+?[1-9]\d{1,14}$/;

/**
 * @description Data transfer object for creating a new user.
 */
export class CreateUserDto {
  /**
   * @description The user's email address. Must be unique within the company.
   * @example "john.doe@example.com"
   */
  @IsEmail()
  email!: string;

  /**
   * @description The first name of the user.
   * @example "John"
   */
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  /**
   * @description The last name of the user.
   * @example "Doe"
   */
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  /**
   * @description The plain text password for the new user. Must be at least 6 characters long.
   * @example "password123"
   */
  @IsString()
  @MinLength(6)
  password!: string;

  /**
   * @description The unique identifier of the role to assign to the new user.
   * @example "r1o2l3e4-i5d6-7890-1234-567890abcdef"
   */
  @IsUUID()
  roleId!: string;

  /**
   * @description Optional: The user's phone number in E.164 format.
   * @example "+15551234567"
   */
  @IsString()
  @IsOptional()
  @Matches(E164, { message: 'phoneNumber must be E.164' })
  phoneNumber?: string;
}

/**
 * @description Data transfer object for updating an existing user.
 */
export class UpdateUserDto {
  /**
   * @description Optional: The updated email address for the user.
   * @example "jane.doe@example.com"
   */
  @IsEmail()
  @IsOptional()
  email?: string;

  /**
   * @description Optional: The updated first name of the user.
   * @example "Jane"
   */
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  /**
   * @description Optional: The updated last name of the user.
   * @example "Smith"
   */
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  /**
   * @description Optional: The updated plain text password for the user. Must be at least 6 characters long.
   * @example "newpassword456"
   */
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  /**
   * @description Optional: The new unique identifier of the role to assign to the user.
   * @example "r7o8l9e0-i1d2-3456-7890-123456abcdef"
   */
  @IsUUID()
  @IsOptional()
  roleId?: string;

  /**
   * @description Optional: The new unique identifier of the status to assign to the user.
   * @example "s1t2a3t4-u5s6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsOptional()
  statusId?: string;

  /**
   * @description Optional: The new unique identifier of the company the user should belong to.
   * @example "c1o2m3p4-a5n6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsOptional()
  companyId?: string;

  /**
   * @description Optional: The updated phone number for the user in E.164 format.
   * @example "+15559876543"
   */
  @IsString()
  @IsOptional()
  @Matches(E164, { message: 'phoneNumber must be E.164' })
  phoneNumber?: string;
}

/**
 * @description Data transfer object for a user updating their own profile. This DTO excludes fields like role, status, or company ID, which typically require administrative privileges to change.
 */
export class UpdateMeDto {
  /**
   * @description Optional: The updated email address for the current user.
   * @example "current.user@example.com"
   */
  @IsEmail()
  @IsOptional()
  email?: string;

  /**
   * @description Optional: The updated first name of the current user.
   * @example "Current"
   */
  @IsString()
  @IsOptional()
  firstName?: string;

  /**
   * @description Optional: The updated last name of the current user.
   * @example "User"
   */
  @IsString()
  @IsOptional()
  lastName?: string;

  /**
   * @description Optional: The updated phone number for the current user in E.164 format.
   * @example "+15551112222"
   */
  @IsString()
  @IsOptional()
  @Matches(E164, { message: 'phoneNumber must be E.164' })
  phoneNumber?: string;
}

/**
 * @description Data transfer object for a user changing their own password.
 */
export class ChangePasswordDto {
  /**
   * @description The user's current password, required for verification.
   * @example "oldpassword123"
   */
  @IsString()
  currentPassword!: string;

  /**
   * @description The new password for the user. Must be at least 6 characters long.
   * @example "strongnewpass456"
   */
  @IsString()
  @MinLength(6)
  newPassword!: string;
}

/**
 * @description Data transfer object for filtering and paginating a list of users.
 */
export class ListUsersQueryDto extends PaginationQueryDto {
  /**
   * @description Optional: Filter users by their assigned role's unique identifier.
   * @example "r1o2l3e4-i5d6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsOptional()
  roleId?: string;

  /**
   * @description Optional: Filter users by their current status's unique identifier.
   * @example "s1t2a3t4-u5s6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsOptional()
  statusId?: string;

  /**
   * @description Optional: A company-wide search query string. This can search across fields like email, first name, and last name, overriding the base `q` semantics if present.
   * @example "john.doe"
   */
  @IsString()
  @IsOptional()
  declare q?: string;
}

/**
 * @description Data transfer object for an administrator to revoke a specific user session by its ID.
 */
export class RevokeSessionDto {
  /**
   * @description The unique identifier of the session to be revoked.
   * @example "s1e2s3s4-i5o6n7i8-9012-3456-7890abcdef"
   */
  @IsUUID()
  sessionId!: string;
}

/**
 * @description Data transfer object for an active session response, providing details about a user's active login session.
 */
export class ActiveSessionResponseDto {
  /**
   * @description The unique identifier of the active session.
   * @example "s1e2s3s4-i5o6n7i8-9012-3456-7890abcdef"
   */
  id!: string;
  /**
   * @description The unique identifier of the user associated with this session.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  userId!: string;
  /**
   * @description The unique identifier of the company the user belongs to.
   * @example "c1o2m3p4-a5n6-7890-1234-567890abcdef"
   */
  companyId!: string;
  /**
   * @description Optional: The IP address from which the session originated.
   * @example "192.168.1.100"
   */
  ip?: string;
  /**
   * @description Optional: The user agent string of the client that initiated the session.
   * @example "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
   */
  userAgent?: string;
  /**
   * @description Optional: A unique identifier for the device associated with the session.
   * @example "d1e2v3i4-c5e6i7d8-9012-3456-7890abcdef"
   */
  deviceId?: string;
  /**
   * @description Optional: The date and time when the session was last seen active.
   * @example "2023-10-27T15:30:00Z"
   */
  lastSeenAt?: Date;
  /**
   * @description Optional: The date and time when the session was created.
   * @example "2023-10-27T10:00:00Z"
   */
  createdAt?: Date;
  /**
   * @description Optional: The date and time when the session is set to expire.
   * @example "2023-11-03T10:00:00Z"
   */
  expiresAt?: Date;
  /**
   * @description Optional: The date and time when the session was revoked.
   * @example "2023-10-27T16:00:00Z"
   */
  revokedAt?: Date;
}
