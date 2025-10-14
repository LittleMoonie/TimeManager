/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActiveSession } from './ActiveSession';
import type { Company } from './Company';
import type { Role } from './Role';
import type { UserStatus } from './UserStatus';
export type User = {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdByUserId?: string;
  updatedByUserId?: string;
  companyId: string;
  company: Company;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  mustChangePasswordAtNextLogin: boolean;
  roleId: string;
  role: Role;
  phoneNumber?: string;
  lastLogin?: string;
  isAnonymized: boolean;
  activeSessions: Array<ActiveSession>;
  statusId: string;
  status: UserStatus;
};
