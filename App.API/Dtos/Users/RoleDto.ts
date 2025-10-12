import { IsNotEmpty, IsString, IsOptional } from "class-validator";

/**
 * @summary Data transfer object for creating a new role.
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
   * @description Optional: A description for the role.
   * @example "Administrator role with full access."
   */
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * @summary Data transfer object for updating an existing role.
 */
export class UpdateRoleDto {
  /**
   * @description The updated name of the role.
   * @example "Super Admin"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * @description Optional: An updated description for the role.
   * @example "Super Administrator role with elevated privileges."
   */
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * @summary Data transfer object for a role response.
 */
export class RoleResponse {
  /**
   * @description The unique identifier of the role.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  id!: string;
  /**
   * @description The name of the role.
   * @example "Admin"
   */
  name!: string;
  /**
   * @description Optional: A description for the role.
   * @example "Administrator role with full access."
   */
  description?: string;
  /**
   * @description The ID of the company to which the role belongs.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  companyId!: string;
}
