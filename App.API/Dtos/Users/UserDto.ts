import {
    IsEmail,
    IsString,
    IsNotEmpty,
    MinLength,
    IsUUID,
    IsOptional,
    Matches,
  } from "class-validator";
  import { PaginationQueryDto } from "../Common/PaginationDto";
  
  /** Common E.164 phone regex */
  const E164 = /^\+?[1-9]\d{1,14}$/;
  
  /**
   * @summary Data transfer object for creating a new user.
   */
  export class CreateUserDto {
    /** @description The user's email address. */
    @IsEmail()
    email!: string;
  
    /** @description First name. */
    @IsString()
    @IsNotEmpty()
    firstName!: string;
  
    /** @description Last name. */
    @IsString()
    @IsNotEmpty()
    lastName!: string;
  
    /** @description Plain password (min 6 chars). */
    @IsString()
    @MinLength(6)
    password!: string;
  
    /** @description Role id to assign. */
    @IsUUID()
    roleId!: string;
  
    /** @description Optional E.164 phone number. */
    @IsString()
    @IsOptional()
    @Matches(E164, { message: "phoneNumber must be E.164" })
    phoneNumber?: string;
  }
  
  /**
   * @summary Data transfer object for updating an existing user.
   */
  export class UpdateUserDto {
    /** @description Optional updated email. */
    @IsEmail()
    @IsOptional()
    email?: string;
  
    /** @description Optional updated first name. */
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    firstName?: string;
  
    /** @description Optional updated last name. */
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    lastName?: string;
  
    /** @description Optional updated password (min 6). */
    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;
  
    /** @description Optional new role id. */
    @IsUUID()
    @IsOptional()
    roleId?: string;
  
    /** @description Optional new status id. */
    @IsUUID()
    @IsOptional()
    statusId?: string;
  
    /** @description Optional new company id. */
    @IsUUID()
    @IsOptional()
    companyId?: string;
  
    /** @description Optional updated phone number. */
    @IsString()
    @IsOptional()
    @Matches(E164, { message: "phoneNumber must be E.164" })
    phoneNumber?: string;
  }
  
  /**
   * @summary DTO for user updating their own profile (no role/status/company).
   */
  export class UpdateMeDto {
    @IsEmail()
    @IsOptional()
    email?: string;
  
    @IsString()
    @IsOptional()
    firstName?: string;
  
    @IsString()
    @IsOptional()
    lastName?: string;
  
    @IsString()
    @IsOptional()
    @Matches(E164, { message: "phoneNumber must be E.164" })
    phoneNumber?: string;
  }
  
  /**
   * @summary DTO for a user changing their own password.
   */
  export class ChangePasswordDto {
    /** @description Current password. */
    @IsString()
    currentPassword!: string;
  
    /** @description New password (min 6). */
    @IsString()
    @MinLength(6)
    newPassword!: string;
  }
  
  /** @summary Filters + pagination for listing users. */
  export class ListUsersQueryDto extends PaginationQueryDto {
    /** @description Optional filter by role id. */
    @IsUUID()
    @IsOptional()
    roleId?: string;
  
    /** @description Optional filter by status id. */
    @IsUUID()
    @IsOptional()
    statusId?: string;
  
    /** @description Optional company-wide search (overrides base q semantics). */
    @IsString()
    @IsOptional()
    declare q?: string;
  }
  
  /** @summary Admin-driven session revocation by id. */
  export class RevokeSessionDto {
    /** @description Session id to revoke. */
    @IsUUID()
    sessionId!: string;
  }
  
  /** @summary Data transfer object for an active session response. */
  export class ActiveSessionResponseDto {
    id!: string;
    userId!: string;
    companyId!: string;
    ip?: string;
    userAgent?: string;
    deviceId?: string;
    lastSeenAt?: Date;
    createdAt?: Date;
    expiresAt?: Date;
    revokedAt?: Date;
  }
  