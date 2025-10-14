/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { Company } from './Company';
import type { RolePermission } from './RolePermission';
import type { User } from './User';
export type Role = {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdByUserId?: string;
  updatedByUserId?: string;
  companyId: string;
  company: Company;
  name: string;
  description?: string;
  rolePermissions: Array<RolePermission>;
  users: Array<User>;
};
