/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TimesheetHistory } from '../models/TimesheetHistory';
import type { TimesheetHistoryDto } from '../models/TimesheetHistoryDto';
import type { TimesheetHistoryEntityTypeEnum } from '../models/TimesheetHistoryEntityTypeEnum';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TimesheetHistoryService {
    /**
     * Retrieve a paginated list of timesheet history events.
     * Employees can only view their own history. Managers/Admins can view organization-wide history.
     * @returns any A paginated list of timesheet history events.
     * @throws ApiError
     */
    public static listHistory({
        requestBody,
    }: {
        /**
         * Body parameters for filtering and pagination.
         */
        requestBody: TimesheetHistoryDto,
    }): CancelablePromise<{
        nextCursor?: string;
        data: Array<TimesheetHistory>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/timesheet-history/filter',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieve timesheet history events for a specific entity.
     * Employees can only view history related to their own timesheets. Managers/Admins can view organization-wide history.
     * @returns any A paginated list of timesheet history events for the specified entity.
     * @throws ApiError
     */
    public static getHistoryForEntity({
        entityType,
        entityId,
    }: {
        /**
         * The type of the entity (e.g., 'TimesheetEntry', 'TimesheetWeek').
         */
        entityType: TimesheetHistoryEntityTypeEnum,
        /**
         * The UUID of the entity.
         */
        entityId: string,
    }): CancelablePromise<{
        nextCursor?: string;
        data: Array<TimesheetHistory>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/timesheet-history/entity/{entityType}/{entityId}',
            path: {
                'entityType': entityType,
                'entityId': entityId,
            },
        });
    }
}
