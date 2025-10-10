/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Approval } from '../models/Approval';
import type { Partial_TimesheetEntryDto_ } from '../models/Partial_TimesheetEntryDto_';
import type { TimesheetEntry } from '../models/TimesheetEntry';
import type { TimesheetEntryDto } from '../models/TimesheetEntryDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TimeService {
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static getWeekTimesheet({
        week,
        page = 1,
        limit = 10,
    }: {
        week: string,
        page?: number,
        limit?: number,
    }): CancelablePromise<{
        lastPage: number;
        page: number;
        total: number;
        data: Array<TimesheetEntry>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/time',
            query: {
                'week': week,
                'page': page,
                'limit': limit,
            },
        });
    }
    /**
     * @returns TimesheetEntry Ok
     * @throws ApiError
     */
    public static createTimeEntry({
        requestBody,
    }: {
        requestBody: TimesheetEntryDto,
    }): CancelablePromise<TimesheetEntry> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/time',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static updateTimeEntry({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: Partial_TimesheetEntryDto_,
    }): CancelablePromise<TimesheetEntry | null> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/time/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static deleteTimeEntry({
        id,
    }: {
        id: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/time/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static approveTimeEntry({
        id,
    }: {
        id: string,
    }): CancelablePromise<Approval | null> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/time/{id}/approve',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static rejectTimeEntry({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: {
            reason?: string;
        },
    }): CancelablePromise<Approval | null> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/time/{id}/reject',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
