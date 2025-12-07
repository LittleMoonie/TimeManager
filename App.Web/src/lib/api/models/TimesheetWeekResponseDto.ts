/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TimesheetStatus } from './TimesheetStatus';
import type { TimesheetWeekRejectionDto } from './TimesheetWeekRejectionDto';
import type { TimesheetWeekRowDto } from './TimesheetWeekRowDto';
import type { TimesheetWeekSettingsDto } from './TimesheetWeekSettingsDto';
export type TimesheetWeekResponseDto = {
    weekStart: string;
    weekEnd: string;
    status: TimesheetStatus;
    rows: Array<TimesheetWeekRowDto>;
    settings: TimesheetWeekSettingsDto;
    rejection?: TimesheetWeekRejectionDto;
};

