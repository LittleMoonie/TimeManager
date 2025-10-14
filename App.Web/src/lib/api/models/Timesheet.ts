/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from './Company';
import type { TimesheetEntry } from './TimesheetEntry';
import type { TimesheetStatus } from './TimesheetStatus';
import type { User } from './User';
export type Timesheet = {
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
    periodStart: string;
    periodEnd: string;
    status: TimesheetStatus;
    submittedAt?: string;
    submittedByUserId?: string;
    approvedAt?: string;
    approverId?: string;
    totalMinutes: number;
    notes?: string;
    entries: Array<TimesheetEntry>;
};

