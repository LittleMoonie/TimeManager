/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LeaveType } from './LeaveType';
export type CreateLeaveRequestDto = {
  userId: string;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason?: string;
};
