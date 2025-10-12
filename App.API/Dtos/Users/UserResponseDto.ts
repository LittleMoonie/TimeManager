import { RoleResponse } from "../Roles/RoleDto";
import { CompanyResponseDto } from "../Companies/CompanyDto";
import { UserStatusResponseDto } from "./UserStatusDto";

/**
 * @summary Response DTO for a user. (Never return the entity directly.)
 */
export class UserResponseDto {
  /** @description User id. */
  id!: string;

  /** @description Email (unique within company). */
  email!: string;

  /** @description First name. */
  firstName!: string;

  /** @description Last name. */
  lastName!: string;

  /** @description Company id. */
  companyId!: string;

  /** @description Optional: company details. */
  company?: CompanyResponseDto;

  /** @description Role id. */
  roleId!: string;

  /** @description Optional: role details. */
  role?: RoleResponse;

  /** @description Status id. */
  statusId!: string;

  /** @description Optional: status details. */
  status?: UserStatusResponseDto;

  /** @description ISO timestamp when the user was created. */
  createdAt!: Date;

  /** @description Optional: E.164 phone. */
  phoneNumber?: string;

  /** @description Optional: last login ISO timestamp. */
  lastLogin?: Date;

  /** @description Optional: soft-deleted at timestamp (if included). */
  deletedAt?: Date | null;
}
