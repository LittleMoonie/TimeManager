/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTimesheetEntryDto } from '../models/CreateTimesheetEntryDto';
import type { TimesheetEntryResponseDto } from '../models/TimesheetEntryResponseDto';
import type { UpdateTimesheetEntryDto } from '../models/UpdateTimesheetEntryDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TimesheetEntriesService {
    /**
     * Creates a new timesheet entry for the authenticated user.
     * @returns TimesheetEntryResponseDto The newly created timesheet entry.
     * @throws ApiError
     */
    public static createTimesheetEntry({
        requestBody,
    }: {
        /**
         * The data for creating the timesheet entry.
         */
        requestBody: CreateTimesheetEntryDto,
    }): CancelablePromise<TimesheetEntryResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/timesheet-entries',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieves a single timesheet entry by its ID.
     * @returns TimesheetEntryResponseDto The timesheet entry details.
     * @throws ApiError
     */
    public static getTimesheetEntry({
        id,
    }: {
        /**
         * The ID of the timesheet entry to retrieve.
         */
        id: string,
    }): CancelablePromise<TimesheetEntryResponseDto> {
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
     * @returns TimesheetEntryResponseDto The updated timesheet entry details.
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
    }): CancelablePromise<TimesheetEntryResponseDto> {
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
    /**
     * Submits a timesheet entry for approval.
     * @returns TimesheetEntryResponseDto Ok
     * @throws ApiError
     */
    public static submitTimesheetEntry({
        id,
    }: {
        /**
         * The ID of the timesheet entry to submit.
         */
        id: string,
    }): CancelablePromise<TimesheetEntryResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/timesheet-entries/{id}/submit',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Approves a pending timesheet entry.
     * @returns TimesheetEntryResponseDto Ok
     * @throws ApiError
     */
    public static approveTimesheetEntry({
        id,
    }: {
        /**
         * The ID of the timesheet entry to approve.
         */
        id: string,
    }): CancelablePromise<TimesheetEntryResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/timesheet-entries/{id}/approve',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Rejects a pending timesheet entry.
     * @returns TimesheetEntryResponseDto Ok
     * @throws ApiError
     */
    public static rejectTimesheetEntry({
        id,
    }: {
        /**
         * The ID of the timesheet entry to reject.
         */
        id: string,
    }): CancelablePromise<TimesheetEntryResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/timesheet-entries/{id}/reject',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Marks an approved timesheet entry as invoiced.
     * @returns TimesheetEntryResponseDto Ok
     * @throws ApiError
     */
    public static invoiceTimesheetEntry({
        id,
    }: {
        /**
         * The ID of the timesheet entry to mark as invoiced.
         */
        id: string,
    }): CancelablePromise<TimesheetEntryResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/timesheet-entries/{id}/invoice',
            path: {
                'id': id,
            },
        });
    }
}
