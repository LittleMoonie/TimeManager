/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActionCode } from '../models/ActionCode';
import type { CreateActionCodeDto } from '../models/CreateActionCodeDto';
import type { UpdateActionCodeDto } from '../models/UpdateActionCodeDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ActionCodesService {
    /**
     * Retrieve a list of action codes for the organization.
     * @returns ActionCode A list of action codes.
     * @throws ApiError
     */
    public static listActionCodes({
        q,
    }: {
        /**
         * Optional search query to filter action codes by name.
         */
        q?: string,
    }): CancelablePromise<Array<ActionCode>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/action-codes',
            query: {
                'q': q,
            },
        });
    }
    /**
     * Create a new action code.
     * Only Managers/Admins can create action codes.
     * @returns ActionCode The newly created action code.
     * @throws ApiError
     */
    public static createActionCode({
        requestBody,
    }: {
        /**
         * The action code creation payload.
         */
        requestBody: CreateActionCodeDto,
    }): CancelablePromise<ActionCode> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/action-codes',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update an existing action code.
     * Only Managers/Admins can update action codes.
     * @returns any The updated action code.
     * @throws ApiError
     */
    public static updateActionCode({
        id,
        requestBody,
    }: {
        /**
         * The UUID of the action code to update.
         */
        id: string,
        /**
         * The action code update payload.
         */
        requestBody: UpdateActionCodeDto,
    }): CancelablePromise<ActionCode | null> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/action-codes/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete an action code.
     * Only Managers/Admins can delete action codes.
     * @returns void
     * @throws ApiError
     */
    public static deleteActionCode({
        id,
    }: {
        /**
         * The UUID of the action code to delete.
         */
        id: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/action-codes/{id}',
            path: {
                'id': id,
            },
        });
    }
}
