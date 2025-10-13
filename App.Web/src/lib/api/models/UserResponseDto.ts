/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { CompanyResponseDto } from './CompanyResponseDto';
import type { RoleResponse } from './RoleResponse';
import type { UserStatusResponseDto } from './UserStatusResponseDto';
export type UserResponseDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  company?: CompanyResponseDto;
  roleId: string;
  role?: RoleResponse;
  statusId: string;
  status?: UserStatusResponseDto;
  createdAt: string;
  phoneNumber?: string;
  lastLogin?: string;
  deletedAt?: string | null;
};
