/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActionCodeCategoryResponseDto } from '../models/ActionCodeCategoryResponseDto';
import type { CreateActionCodeCategoryDto } from '../models/CreateActionCodeCategoryDto';
import type { UpdateActionCodeCategoryDto } from '../models/UpdateActionCodeCategoryDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ActionCodeCategoriesService {
    /**
     * @returns ActionCodeCategoryResponseDto Ok
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<ActionCodeCategoryResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/action-code-categories',
        });
    }
    /**
     * @returns ActionCodeCategoryResponseDto Ok
     * @throws ApiError
     */
    public static create({
        requestBody,
    }: {
        requestBody: CreateActionCodeCategoryDto,
    }): CancelablePromise<ActionCodeCategoryResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/action-code-categories',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ActionCodeCategoryResponseDto Ok
     * @throws ApiError
     */
    public static getById({
        id,
    }: {
        id: string,
    }): CancelablePromise<ActionCodeCategoryResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/action-code-categories/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ActionCodeCategoryResponseDto Ok
     * @throws ApiError
     */
    public static update({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: UpdateActionCodeCategoryDto,
    }): CancelablePromise<ActionCodeCategoryResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/action-code-categories/{id}',
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
    public static delete({
        id,
    }: {
        id: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/action-code-categories/{id}',
            path: {
                'id': id,
            },
        });
    }
}
