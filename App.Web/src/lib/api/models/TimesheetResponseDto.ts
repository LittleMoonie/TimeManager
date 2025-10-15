/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TimesheetEntryResponseDto } from './TimesheetEntryResponseDto';
export type TimesheetResponseDto = {
    id: string;
    userId: string;
    periodStart: string;
    periodEnd: string;
    status: string;
    totalMinutes: number;
    notes?: string;
    entries?: Array<TimesheetEntryResponseDto>;
};

