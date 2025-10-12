import { IsNotEmpty, IsString, IsOptional } from "class-validator";

/**
 * @summary Data transfer object for creating a new permission.
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
   * @description Optional: A description for the permission.
   * @example "Allows creation of new user accounts."
   */
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * @summary Data transfer object for updating an existing permission.
 */
export class UpdatePermissionDto {
  /**
   * @description The updated name of the permission.
   * @example "edit_user"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * @description Optional: An updated description for the permission.
   * @example "Allows editing of existing user accounts."
   */
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * @summary Interface for a permission response.
 */
export interface PermissionResponse {
  /**
   * @description The unique identifier of the permission.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  id: string;
  /**
   * @description The name of the permission.
   * @example "create_user"
   */
  name: string;
  /**
   * @description Optional: A description for the permission.
   * @example "Allows creation of new user accounts."
   */
  description?: string;
  /**
   * @description The ID of the company to which the permission belongs.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  companyId: string;
}
