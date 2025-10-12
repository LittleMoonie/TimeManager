import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

/* ========================
 * Role DTOs
 * ====================== */

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class RoleResponse {
  id!: string;
  name!: string;
  description?: string;
  companyId!: string;
}

/* ========================
 * Permission DTOs
 * ====================== */

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePermissionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class PermissionResponseDto {
  id!: string;
  name!: string;
  description?: string;
  companyId!: string;
}

/* ========================
 * RolePermission DTOs
 * ====================== */

export class CreateRolePermissionDto {
  @IsUUID()
  @IsNotEmpty()
  roleId!: string;

  @IsUUID()
  @IsNotEmpty()
  permissionId!: string;
}

export class RolePermissionResponseDto {
  id!: string;
  roleId!: string;
  permissionId!: string;
}
