/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { CreateUserDto } from '../models/CreateUserDto';
import type { UpdateUserDto } from '../models/UpdateUserDto';
import type { UserResponse } from '../models/UserResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Create a new user (Admin/Manager only)
     * @returns UserResponse User created successfully
     * @throws ApiError
     */
    public static createUser({
        requestBody,
    }: {
        /**
         * User creation data
         */
        requestBody: CreateUserDto,
    }): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Authentication required`,
                403: `Forbidden`,
                422: `Validation error`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get user by ID
     * @returns UserResponse User retrieved successfully
     * @throws ApiError
     */
    public static getUser({
        id,
    }: {
        /**
         * The user's ID
         */
        id: string,
    }): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Authentication required`,
                403: `Forbidden`,
                404: `User not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update user by ID (Admin/Manager only)
     * @returns UserResponse User updated successfully
     * @throws ApiError
     */
    public static updateUser({
        id,
        requestBody,
    }: {
        /**
         * The user's ID
         */
        id: string,
        /**
         * User update data
         */
        requestBody: UpdateUserDto,
    }): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Authentication required`,
                403: `Forbidden`,
                404: `User not found`,
                422: `Validation error`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete user by ID (Admin/Manager only)
     * @returns ApiResponse User deleted successfully
     * @throws ApiError
     */
    public static deleteUser({
        id,
    }: {
        /**
         * The user's ID
         */
        id: string,
    }): CancelablePromise<ApiResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Authentication required`,
                403: `Forbidden`,
                404: `User not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * @returns ApiResponse Weekend permit granted successfully
     * @throws ApiError
     */
    public static grantWeekendPermit({
        id,
    }: {
        id: string,
    }): CancelablePromise<ApiResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/{id}/weekend-permit',
            path: {
                'id': id,
            },
            errors: {
                401: `Authentication required`,
                403: `Forbidden`,
                404: `User not found`,
                500: `Internal server error`,
            },
        });
    }
}
