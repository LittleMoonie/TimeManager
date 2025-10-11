/**
 * User Data Transfer Objects for API requests and responses
 */
import { RoleResponse } from "./RoleDto";
import { UserStatusResponseDto } from "./UserStatusDto";
import { CompanyResponseDto } from "../Company/CompanyDto";

export class UserResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  companyId!: string;
  company?: CompanyResponseDto;
  roleId!: string;
  role?: RoleResponse;
  statusId!: string;
  status?: UserStatusResponseDto;
  createdAt!: Date;
  phone?: string;
  lastLogin?: Date;
}

export class ApiResponse {
  message!: string;
}

export class AuthResponse {
  token!: string;
  user!: UserResponseDto;
}
