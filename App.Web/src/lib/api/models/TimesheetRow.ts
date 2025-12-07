/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActionCode } from './ActionCode';
import type { Company } from './Company';
import type { Timesheet } from './Timesheet';
import type { TimesheetEntry } from './TimesheetEntry';
import type { TimesheetRowBillableTag } from './TimesheetRowBillableTag';
import type { TimesheetRowLocation } from './TimesheetRowLocation';
import type { TimesheetRowStatus } from './TimesheetRowStatus';
import type { User } from './User';
export type TimesheetRow = {
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
    timesheetId: string;
    timesheet: Timesheet;
    activityLabel: string;
    timeCodeId: string;
    timeCode: ActionCode;
    billable: TimesheetRowBillableTag;
    location: TimesheetRowLocation;
    employeeCountryCode?: string;
    countryCode: string;
    status: TimesheetRowStatus;
    locked: boolean;
    sortOrder: number;
    entries: Array<TimesheetEntry>;
};

