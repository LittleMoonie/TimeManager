/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TimesheetRowBillableTag } from './TimesheetRowBillableTag';
import type { TimesheetRowLocation } from './TimesheetRowLocation';
import type { TimesheetRowStatus } from './TimesheetRowStatus';
import type { TimesheetWeekRowEntryDto } from './TimesheetWeekRowEntryDto';
import type { TimesheetWeekRowRejectionDto } from './TimesheetWeekRowRejectionDto';
export type TimesheetWeekRowDto = {
    id?: string;
    activityLabel: string;
    timeCodeId: string;
    billable: TimesheetRowBillableTag;
    location: TimesheetRowLocation;
    countryCode: string;
    employeeCountryCode?: string | null;
    status: TimesheetRowStatus;
    locked: boolean;
    entries: Array<TimesheetWeekRowEntryDto>;
    rejection?: TimesheetWeekRowRejectionDto;
};

