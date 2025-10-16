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
    }: {
        weekStart: string,
    }): CancelablePromise<TimesheetWeekResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/timesheet/weeks/{weekStart}/timesheet',
            path: {
                'weekStart': weekStart,
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
    }: {
        weekStart: string,
        requestBody: TimesheetWeekUpsertDto,
    }): CancelablePromise<TimesheetWeekResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/timesheet/weeks/{weekStart}/timesheet',
            path: {
                'weekStart': weekStart,
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
        requestBody,
    }: {
        weekStart: string,
        requestBody?: TimesheetWeekSubmitDto,
    }): CancelablePromise<TimesheetWeekResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/timesheet/weeks/{weekStart}/submit',
            path: {
                'weekStart': weekStart,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
