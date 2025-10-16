/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TimesheetEntryStatus } from './TimesheetEntryStatus';
import type { WorkMode } from './WorkMode';
export type TimesheetEntryResponseDto = {
    id: string;
    actionCodeId: string;
    day: string;
    durationMin: number;
    country: string;
    workMode: WorkMode;
    note?: string;
    status: TimesheetEntryStatus;
    statusUpdatedAt?: string;
};

