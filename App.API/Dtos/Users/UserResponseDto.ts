import { CompanyResponseDto } from '../../Dtos/Companies/CompanyDto';
import { RoleResponse } from '../../Dtos/Roles/RoleDto';
import { UserStatusResponseDto } from '../../Dtos/Users/UserStatusDto';

/**
 * @description Data transfer object for a user response. This DTO should be used when returning user information to clients, never return the entity directly.
 */
export class UserResponseDto {
  /**
   * @description The unique identifier of the user.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  id!: string;

  /**
   * @description The user's email address, unique within the company.
   * @example "john.doe@example.com"
   */
  email!: string;

  /**
   * @description The first name of the user.
   * @example "John"
   */
  firstName!: string;

  /**
   * @description The last name of the user.
   * @example "Doe"
   */
  lastName!: string;

  /**
   * @description The unique identifier of the company the user belongs to.
   * @example "c1o2m3p4-a5n6-7890-1234-567890abcdef"
   */
  companyId!: string;

  /**
   * @description Optional: Detailed information about the company the user belongs to.
   */
  company?: CompanyResponseDto;

  /**
   * @description The unique identifier of the role assigned to the user.
   * @example "r1o2l3e4-i5d6-7890-1234-567890abcdef"
   */
  roleId!: string;

  /**
   * @description Optional: Detailed information about the role assigned to the user.
   */
  role?: RoleResponse;

  /**
   * @description The unique identifier of the user's current status.
   * @example "s1t2a3t4-u5s6-7890-1234-567890abcdef"
   */
  statusId!: string;

  /**
   * @description Optional: Detailed information about the user's current status.
   */
  status?: UserStatusResponseDto;

  /**
   * @description The ISO timestamp when the user account was created.
   * @example "2023-10-27T10:00:00Z"
   */
  createdAt!: Date;

  /**
   * @description Optional: The user's phone number in E.164 format.
   * @example "+15551234567"
   */
  phoneNumber?: string;

  /**
   * @description Optional: The ISO timestamp of the user's last successful login.
   * @example "2023-10-27T11:30:00Z"
   */
  lastLogin?: Date;

  /**
   * @description Optional: The ISO timestamp when the user account was soft-deleted. Null if not deleted.
   * @example "2023-10-27T12:00:00Z"
   */
  deletedAt?: Date | null;

  /**
   * @description Optional: The list of permissions associated with the user's role.
   * @example ["timesheet.view.self", "timesheet.create.self"]
   */
  permissions?: string[];
}
