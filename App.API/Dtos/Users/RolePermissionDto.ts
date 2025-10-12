import { IsNotEmpty, IsUUID } from "class-validator";

/**
 * @summary Data transfer object for creating a new role permission.
 */
export class CreateRolePermissionDto {
  /**
   * @description The ID of the role.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsNotEmpty()
  roleId!: string;

  /**
   * @description The ID of the permission.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  @IsUUID()
  @IsNotEmpty()
  permissionId!: string;
}

/**
 * @summary Data transfer object for a role permission response.
 */
export class RolePermissionResponseDto {
  /**
   * @description The unique identifier of the role permission.
   * @example "1a2b3c4d-5e6f-7890-abcd-ef1234567890"
   */
  id!: string;
  /**
   * @description The ID of the role.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  roleId!: string;
  /**
   * @description The ID of the permission.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  permissionId!: string;
}
