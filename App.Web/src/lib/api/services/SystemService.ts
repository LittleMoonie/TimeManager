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
     * Enhanced health check with OpenAPI status
     * @returns HealthResponse System is healthy
     * @throws ApiError
     */
    public static getHealth({
        autoGen,
    }: {
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
     * Manually trigger OpenAPI spec generation
     * @returns GenerateResponse OpenAPI generation triggered
     * @throws ApiError
     */
    public static generateOpenApi({
        frontend,
    }: {
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
     * Get OpenAPI generation status
     * @returns any OpenAPI status retrieved
     * @throws ApiError
     */
    public static getOpenApiStatus(): CancelablePromise<{
        needsRegeneration: boolean;
        lastGeneratedAt: string;
        isGenerating: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/system/openapi-status',
        });
    }
}
