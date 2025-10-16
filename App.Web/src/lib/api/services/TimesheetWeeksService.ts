/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TimesheetWeekResponseDto } from '../models/TimesheetWeekResponseDto';
import type { TimesheetWeekSubmitDto } from '../models/TimesheetWeekSubmitDto';
import type { TimesheetWeekUpsertDto } from '../models/TimesheetWeekUpsertDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TimesheetWeeksService {
    /**
     * @returns TimesheetWeekResponseDto Ok
     * @throws ApiError
     */
    public static getWeekTimesheet({
        weekStart,
        userId,
    }: {
        weekStart: string,
        userId?: string,
    }): CancelablePromise<TimesheetWeekResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/timesheet/weeks/{weekStart}/timesheet',
            path: {
                'weekStart': weekStart,
            },
            query: {
                'userId': userId,
            },
        });
    }
    /**
     * @returns TimesheetWeekResponseDto Ok
     * @throws ApiError
     */
    public static upsertWeekTimesheet({
        weekStart,
        requestBody,
        userId,
    }: {
        weekStart: string,
        requestBody: TimesheetWeekUpsertDto,
        userId?: string,
    }): CancelablePromise<TimesheetWeekResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/timesheet/weeks/{weekStart}/timesheet',
            path: {
                'weekStart': weekStart,
            },
            query: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns TimesheetWeekResponseDto Ok
     * @throws ApiError
     */
    public static submitWeekTimesheet({
        weekStart,
        userId,
        requestBody,
    }: {
        weekStart: string,
        userId?: string,
        requestBody?: TimesheetWeekSubmitDto,
    }): CancelablePromise<TimesheetWeekResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/timesheet/weeks/{weekStart}/submit',
            path: {
                'weekStart': weekStart,
            },
            query: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
