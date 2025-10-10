/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LeaveRequest } from '../models/LeaveRequest';
import type { LeaveRequestStatus } from '../models/LeaveRequestStatus';
import type { LeaveType } from '../models/LeaveType';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LeaveRequestsService {
    /**
     * @returns LeaveRequest Ok
     * @throws ApiError
     */
    public static getLeaveRequests(): CancelablePromise<Array<LeaveRequest>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/leave-requests',
        });
    }
    /**
     * @returns LeaveRequest Ok
     * @throws ApiError
     */
    public static createLeaveRequest({
        requestBody,
    }: {
        requestBody: {
            reason?: string;
            leaveType: LeaveType;
            endDate: string;
            startDate: string;
        },
    }): CancelablePromise<LeaveRequest> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/leave-requests',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static getLeaveRequest({
        id,
    }: {
        id: string,
    }): CancelablePromise<LeaveRequest | null> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/leave-requests/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static updateLeaveRequestStatus({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: {
            status: LeaveRequestStatus;
        },
    }): CancelablePromise<LeaveRequest | null> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/leave-requests/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
