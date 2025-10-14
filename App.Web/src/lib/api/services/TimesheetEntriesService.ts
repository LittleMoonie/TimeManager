/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTimesheetEntryDto } from '../models/CreateTimesheetEntryDto';
import type { TimesheetEntry } from '../models/TimesheetEntry';
import type { UpdateTimesheetEntryDto } from '../models/UpdateTimesheetEntryDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TimesheetEntriesService {
    /**
     * Creates a new timesheet entry for the authenticated user.
     * @returns TimesheetEntry The newly created timesheet entry.
     * @throws ApiError
     */
    public static createTimesheetEntry({
        requestBody,
    }: {
        /**
         * The data for creating the timesheet entry.
         */
        requestBody: CreateTimesheetEntryDto,
    }): CancelablePromise<TimesheetEntry> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/timesheet-entries',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieves a single timesheet entry by its ID.
     * @returns TimesheetEntry The timesheet entry details.
     * @throws ApiError
     */
    public static getTimesheetEntry({
        id,
    }: {
        /**
         * The ID of the timesheet entry to retrieve.
         */
        id: string,
    }): CancelablePromise<TimesheetEntry> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/timesheet-entries/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Updates an existing timesheet entry.
     * @returns TimesheetEntry The updated timesheet entry details.
     * @throws ApiError
     */
    public static updateTimesheetEntry({
        id,
        requestBody,
    }: {
        /**
         * The ID of the timesheet entry to update.
         */
        id: string,
        /**
         * The data for updating the timesheet entry.
         */
        requestBody: UpdateTimesheetEntryDto,
    }): CancelablePromise<TimesheetEntry> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/timesheet-entries/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Deletes a timesheet entry by its ID.
     * @returns void
     * @throws ApiError
     */
    public static deleteTimesheetEntry({
        id,
    }: {
        /**
         * The ID of the timesheet entry to delete.
         */
        id: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/timesheet-entries/{id}',
            path: {
                'id': id,
            },
        });
    }
}
