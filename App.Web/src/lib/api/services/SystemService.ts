/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GenerateResponse } from '../models/GenerateResponse';
import type { HealthResponse } from '../models/HealthResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SystemService {
    /**
     * Provides an enhanced health check for the API, including its uptime and the status of OpenAPI specification generation.
     * @returns HealthResponse System is healthy
     * @throws ApiError
     */
    public static getHealth({
        autoGen,
    }: {
        /**
         * - If true, triggers OpenAPI specification regeneration if needed.
         */
        autoGen?: boolean,
    }): CancelablePromise<HealthResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/system/health',
            query: {
                'autoGen': autoGen,
            },
        });
    }
    /**
     * Manually triggers the generation of the OpenAPI specification.
     * @returns GenerateResponse OpenAPI generation triggered
     * @throws ApiError
     */
    public static generateOpenApi({
        frontend,
    }: {
        /**
         * - If true, also generates the frontend API client.
         */
        frontend?: boolean,
    }): CancelablePromise<GenerateResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/system/generate-openapi',
            query: {
                'frontend': frontend,
            },
            errors: {
                409: `Generation already in progress`,
                500: `Generation failed`,
            },
        });
    }
    /**
     * Retrieves the current status of the OpenAPI specification generation.
     * @returns any OpenAPI status retrieved
     * @throws ApiError
     */
    public static getOpenApiStatus(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/system/openapi-status',
        });
    }
}
