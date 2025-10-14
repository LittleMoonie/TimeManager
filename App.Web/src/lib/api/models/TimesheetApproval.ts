/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovalStatus } from './ApprovalStatus';
import type { Company } from './Company';
import type { Timesheet } from './Timesheet';
import type { User } from './User';
export type TimesheetApproval = {
    id: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    createdByUserId?: string;
    updatedByUserId?: string;
    companyId: string;
    company: Company;
    timesheetId: string;
    timesheet: Timesheet;
    approverId: string;
    approver: User;
    status: ApprovalStatus;
    reason?: string;
    decidedAt?: string;
};

