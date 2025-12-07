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
     * Searches for action codes within the authenticated user's company.
     * @returns ActionCode An array of matching action codes.
     * @throws ApiError
     */
    public static searchActionCodes({
        q,
    }: {
        /**
         * Optional: The query string to search for.
         */
        q?: string,
    }): CancelablePromise<Array<ActionCode>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/action-codes',
            query: {
                'q': q,
            },
        });
    }
    /**
     * Creates a new action code within the authenticated user's company.
     * @returns ActionCode Action code created successfully
     * @throws ApiError
     */
    public static createActionCode({
        requestBody,
    }: {
        /**
         * The data for creating the action code.
         */
        requestBody: CreateActionCodeDto,
    }): CancelablePromise<ActionCode> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/action-codes',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieves an action code by its ID within the authenticated user's company.
     * @returns ActionCode The action code details.
     * @throws ApiError
     */
    public static getActionCode({
        id,
    }: {
        /**
         * The ID of the action code to retrieve.
         */
        id: string,
    }): CancelablePromise<ActionCode> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/action-codes/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Updates an existing action code within the authenticated user's company.
     * @returns ActionCode The updated action code details.
     * @throws ApiError
     */
    public static updateActionCode({
        id,
        requestBody,
    }: {
        /**
         * The ID of the action code to update.
         */
        id: string,
        /**
         * The data for updating the action code.
         */
        requestBody: UpdateActionCodeDto,
    }): CancelablePromise<ActionCode> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/action-codes/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Deletes an action code by its ID within the authenticated user's company.
     * @returns any Action code deleted successfully
     * @throws ApiError
     */
    public static deleteActionCode({
        id,
    }: {
        /**
         * The ID of the action code to delete.
         */
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/action-codes/{id}',
            path: {
                'id': id,
            },
        });
    }
}
