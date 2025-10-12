import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

/* ========================
 * Role DTOs
 * ====================== */

/**
 * @description Data transfer object for creating a new role.
 */
export class CreateRoleDto {
  /**
   * @description The name of the role.
   * @example "Admin"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * @description Optional: A description of the role.
   * @example "Administrator with full access"
   */
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * @description Data transfer object for updating an existing role.
 */
export class UpdateRoleDto {
  /**
   * @description Optional: The updated name of the role.
   * @example "Super Admin"
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * @description Optional: An updated description of the role.
   * @example "Super Administrator with elevated privileges"
   */
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * @description Data transfer object for a role response.
 */
export class RoleResponse {
  /**
   * @description The unique identifier of the role.
   * @example "r1o2l3e4-i5d6-7890-1234-567890abcdef"
   */
  id!: string;
  /**
   * @description The name of the role.
   * @example "Admin"
   */
  name!: string;
  /**
   * @description Optional: A description of the role.
   * @example "Administrator with full access"
   */
  description?: string;
  /**
   * @description The unique identifier of the company the role belongs to.
   * @example "c1o2m3p4-a5n6-7890-1234-567890abcdef"
   */
  companyId!: string;
}

/* ========================
 * Permission DTOs
 * ====================== */

/**
 * @description Data transfer object for creating a new permission.
 */
export class CreatePermissionDto {
  /**
   * @description The name of the permission.
   * @example "create_user"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * @description Optional: A description of the permission.
   * @example "Allows creation of new user accounts"
   */
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * @description Data transfer object for updating an existing permission.
 */
export class UpdatePermissionDto {
  /**
   * @description Optional: The updated name of the permission.
   * @example "edit_user"
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * @description Optional: An updated description of the permission.
   * @example "Allows editing of existing user accounts"
   */
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * @description Data transfer object for a permission response.
 */
export class PermissionResponseDto {
  /**
   * @description The unique identifier of the permission.
   * @example "p1e2r3m4-i5s6-7890-1234-567890abcdef"
   */
  id!: string;
  /**
   * @description The name of the permission.
   * @example "create_user"
   */
  name!: string;
  /**
   * @description Optional: A description of the permission.
   * @example "Allows creation of new user accounts"
   */
  description?: string;
  /**
   * @description The unique identifier of the company the permission belongs to.
   * @example "c1o2m3p4-a5n6-7890-1234-567890abcdef"
   */
  companyId!: string;
}

/* ========================
 * RolePermission DTOs
 * ====================== */

/**
 * @description Data transfer object for creating a new role-permission association.
 */
export class CreateRolePermissionDto {
  /**
   * @description The unique identifier of the role.
   * @example "r1o2l3e4-i5d6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsNotEmpty()
  roleId!: string;

  /**
   * @description The unique identifier of the permission.
   * @example "p1e2r3m4-i5s6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsNotEmpty()
  permissionId!: string;
}

/**
 * @description Data transfer object for a role-permission association response.
 */
export class RolePermissionResponseDto {
  /**
   * @description The unique identifier of the role-permission association.
   * @example "rp1i2d3-e4f5-6789-0123-456789abcdef"
   */
  id!: string;
  /**
   * @description The unique identifier of the role.
   * @example "r1o2l3e4-i5d6-7890-1234-567890abcdef"
   */
  roleId!: string;
  /**
   * @description The unique identifier of the permission.
   * @example "p1e2r3m4-i5s6-7890-1234-567890abcdef"
   */
  permissionId!: string;
}
