/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTimesheetApprovalDto } from '../models/CreateTimesheetApprovalDto';
import type { TimesheetApproval } from '../models/TimesheetApproval';
import type { UpdateTimesheetApprovalDto } from '../models/UpdateTimesheetApprovalDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TimesheetApprovalsService {
    /**
     * Creates a new timesheet approval.
     * @returns TimesheetApproval The newly created timesheet approval.
     * @throws ApiError
     */
    public static createTimesheetApproval({
        requestBody,
    }: {
        /**
         * The data for creating the timesheet approval.
         */
        requestBody: CreateTimesheetApprovalDto,
    }): CancelablePromise<TimesheetApproval> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/timesheet-approvals',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieves a timesheet approval by its ID.
     * @returns TimesheetApproval The timesheet approval details.
     * @throws ApiError
     */
    public static getTimesheetApproval({
        id,
    }: {
        /**
         * The ID of the timesheet approval to retrieve.
         */
        id: string,
    }): CancelablePromise<TimesheetApproval> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/timesheet-approvals/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Updates an existing timesheet approval.
     * @returns TimesheetApproval The updated timesheet approval details.
     * @throws ApiError
     */
    public static updateTimesheetApproval({
        id,
        requestBody,
    }: {
        /**
         * The ID of the timesheet approval to update.
         */
        id: string,
        /**
         * The data for updating the timesheet approval.
         */
        requestBody: UpdateTimesheetApprovalDto,
    }): CancelablePromise<TimesheetApproval> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/timesheet-approvals/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Deletes a timesheet approval by its ID.
     * @returns void
     * @throws ApiError
     */
    public static deleteTimesheetApproval({
        id,
    }: {
        /**
         * The ID of the timesheet approval to delete.
         */
        id: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/timesheet-approvals/{id}',
            path: {
                'id': id,
            },
        });
    }
}
