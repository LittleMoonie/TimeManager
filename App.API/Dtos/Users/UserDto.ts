/**
 * User Data Transfer Objects for API requests and responses
 */
import { RoleResponse } from "./RoleDto";
import { UserStatusResponseDto } from "./UserStatusDto";
import { CompanyResponseDto } from "../Company/CompanyDto";

/**
 * @summary Data transfer object for a user response.
 */
export class UserDto {
  /**
   * @description The unique identifier of the user.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  id!: string;
  /**
   * @description The user's email address.
   * @example "john.doe@example.com"
   */
  email!: string;
  /**
   * @description The user's first name.
   * @example "John"
   */
  firstName!: string;
  /**
   * @description The user's last name.
   * @example "Doe"
   */
  lastName!: string;
  /**
   * @description The ID of the company the user belongs to.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  companyId!: string;
  /**
   * @description Optional: The company details.
   */
  company?: CompanyResponseDto;
  /**
   * @description The ID of the role assigned to the user.
   * @example "1a2b3c4d-5e6f-7890-abcd-ef1234567890"
   */
  roleId!: string;
  /**
   * @description Optional: The role details.
   */
  role?: RoleResponse;
  /**
   * @description The ID of the user's status.
   * @example "2b3c4d5e-6f7a-8901-bcde-f1234567890a"
   */
  statusId!: string;
  /**
   * @description Optional: The user status details.
   */
  status?: UserStatusResponseDto;
  /**
   * @description The date and time when the user account was created.
   * @example "2023-10-27T10:00:00Z"
   */
  createdAt!: Date;
  /**
   * @description Optional: The user's phone number.
   * @example "+15551234567"
   */
  phone?: string;
  /**
   * @description Optional: The date and time of the user's last login.
   * @example "2023-10-27T11:30:00Z"
   */
  lastLogin?: Date;
}

/**
 * @summary Generic API response for messages.
 */
export class ApiResponse {
  /**
   * @description A message describing the API response.
   * @example "Operation successful"
   */
  message!: string;
}

/**
 * @summary Data transfer object for authentication response.
 保護 */
export class AuthResponse {
  /**
   * @description The JWT authentication token.
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  token!: string;
  /**
   * @description The details of the authenticated user.
   */
  user!: UserDto;
}
