/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Make all properties in T optional
 */
export type Partial_TimesheetEntryDto_ = {
    actionCodeId?: string;
    workMode?: Partial_TimesheetEntryDto_.workMode;
    country?: string;
    startedAt?: string;
    endedAt?: string;
    durationMin?: number;
    note?: string;
    day?: string;
};
export namespace Partial_TimesheetEntryDto_ {
    export enum workMode {
        OFFICE = 'office',
        REMOTE = 'remote',
        HYBRID = 'hybrid',
    }
}

