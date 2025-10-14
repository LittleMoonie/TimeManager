/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from './Company';
import type { LeaveRequestStatus } from './LeaveRequestStatus';
import type { LeaveType } from './LeaveType';
import type { User } from './User';
export type LeaveRequest = {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdByUserId?: string;
  updatedByUserId?: string;
  companyId: string;
  company: Company;
  userId: string;
  user: User;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  status: LeaveRequestStatus;
  reason?: string;
  rejectionReason?: string;
};
