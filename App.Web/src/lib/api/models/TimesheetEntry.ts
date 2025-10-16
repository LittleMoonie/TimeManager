/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActionCode } from './ActionCode';
import type { Company } from './Company';
import type { Timesheet } from './Timesheet';
import type { TimesheetEntryStatus } from './TimesheetEntryStatus';
import type { TimesheetRow } from './TimesheetRow';
import type { User } from './User';
import type { WorkMode } from './WorkMode';
export type TimesheetEntry = {
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
    timesheetId?: string;
    timesheet?: Timesheet;
    timesheetRowId?: string;
    timesheetRow?: TimesheetRow;
    actionCodeId: string;
    actionCode: ActionCode;
    workMode: WorkMode;
    country: string;
    startedAt?: string;
    endedAt?: string;
    durationMin: number;
    day: string;
    note?: string;
    status: TimesheetEntryStatus;
    statusUpdatedAt?: string;
};

