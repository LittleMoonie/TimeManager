/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Partial_TimesheetEntryDto_ } from '../models/Partial_TimesheetEntryDto_';
import type { TimesheetEntry } from '../models/TimesheetEntry';
import type { TimesheetEntryDto } from '../models/TimesheetEntryDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TimeService {
    /**
     * @returns TimesheetEntry Ok
     * @throws ApiError
     */
    public static getWeekTimesheet({
        week,
    }: {
        week: string,
    }): CancelablePromise<Array<TimesheetEntry>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/time',
            query: {
                'week': week,
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
}
