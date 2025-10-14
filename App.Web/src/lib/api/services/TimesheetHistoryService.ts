/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TimesheetHistory } from '../models/TimesheetHistory';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TimesheetHistoryService {
    /**
     * Filters and retrieves timesheet history events by a specific target (e.g., Timesheet, TimesheetEntry).
     * @returns TimesheetHistory An array of TimesheetHistory entities matching the filter criteria.
     * @throws ApiError
     */
    public static listHistory({
        requestBody,
    }: {
        /**
         * The request body containing the target type and ID to filter history by.
         */
        requestBody: {
            targetId: string;
            targetType: 'ActionCode' | 'Timesheet' | 'TimesheetEntry' | 'TimesheetApproval';
        },
    }): CancelablePromise<Array<TimesheetHistory>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/timesheet-history/filter',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
