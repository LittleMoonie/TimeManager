/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTimesheetDto } from '../models/CreateTimesheetDto';
import type { CreateTimesheetEntryDto } from '../models/CreateTimesheetEntryDto';
import type { TimesheetResponseDto } from '../models/TimesheetResponseDto';
import type { UpdateTimesheetDto } from '../models/UpdateTimesheetDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TimesheetsService {
    /**
     * Creates a new timesheet for the authenticated user.
     * @returns TimesheetResponseDto The newly created timesheet.
     * @throws ApiError
     */
    public static createTimesheet({
        requestBody,
    }: {
        /**
         * The data for creating the timesheet.
         */
        requestBody: CreateTimesheetDto,
    }): CancelablePromise<TimesheetResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/timesheets',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieves all timesheets for the authenticated user.
     * @returns TimesheetResponseDto An array of timesheet details.
     * @throws ApiError
     */
    public static getAllTimesheetsForUser(): CancelablePromise<Array<TimesheetResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/timesheets',
        });
    }
    /**
     * Retrieves a single timesheet by its ID.
     * @returns TimesheetResponseDto The timesheet details.
     * @throws ApiError
     */
    public static getTimesheet({
        id,
    }: {
        /**
         * The ID of the timesheet to retrieve.
         */
        id: string,
    }): CancelablePromise<TimesheetResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/timesheets/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Updates an existing timesheet.
     * @returns TimesheetResponseDto The updated timesheet.
     * @throws ApiError
     */
    public static updateTimesheet({
        id,
        requestBody,
    }: {
        /**
         * The ID of the timesheet to update.
         */
        id: string,
        /**
         * The data for updating the timesheet.
         */
        requestBody: UpdateTimesheetDto,
    }): CancelablePromise<TimesheetResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/timesheets/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Adds a new entry to an existing timesheet.
     * @returns TimesheetResponseDto The updated timesheet with the new entry.
     * @throws ApiError
     */
    public static addTimesheetEntry({
        id,
        requestBody,
    }: {
        /**
         * The ID of the timesheet to add the entry to.
         */
        id: string,
        /**
         * The data for creating the timesheet entry.
         */
        requestBody: CreateTimesheetEntryDto,
    }): CancelablePromise<TimesheetResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/timesheets/{id}/entries',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Submits a timesheet for approval.
     * @returns TimesheetResponseDto The updated timesheet.
     * @throws ApiError
     */
    public static submitTimesheet({
        id,
    }: {
        /**
         * The ID of the timesheet to submit.
         */
        id: string,
    }): CancelablePromise<TimesheetResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/timesheets/{id}/submit',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Approves a submitted timesheet.
     * @returns TimesheetResponseDto The updated timesheet.
     * @throws ApiError
     */
    public static approveTimesheet({
        id,
    }: {
        /**
         * The ID of the timesheet to approve.
         */
        id: string,
    }): CancelablePromise<TimesheetResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/timesheets/{id}/approve',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Rejects a submitted timesheet.
     * @returns TimesheetResponseDto The updated timesheet.
     * @throws ApiError
     */
    public static rejectTimesheet({
        id,
        requestBody,
    }: {
        /**
         * The ID of the timesheet to reject.
         */
        id: string,
        /**
         * The body containing the reason for rejection.
         */
        requestBody: {
            reason: string;
        },
    }): CancelablePromise<TimesheetResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/timesheets/{id}/reject',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
