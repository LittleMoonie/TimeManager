/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActiveSessionResponseDto } from '../models/ActiveSessionResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ActiveSessionsService {
    /**
     * Retrieves all active sessions for the authenticated user within their company.
     * @returns ActiveSessionResponseDto An array of active session details.
     * @throws ApiError
     */
    public static getAllUserSessions(): CancelablePromise<Array<ActiveSessionResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/active-sessions',
        });
    }
    /**
     * Revokes a specific active session by its token hash within the authenticated user's company.
     * @returns void
     * @throws ApiError
     */
    public static revokeActiveSession({
        tokenHash,
    }: {
        /**
         * The hash of the refresh token to revoke.
         */
        tokenHash: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/active-sessions/{tokenHash}',
            path: {
                'tokenHash': tokenHash,
            },
        });
    }
}
