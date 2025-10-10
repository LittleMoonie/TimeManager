/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { LoginDto } from '../models/LoginDto';
import type { RegisterDto } from '../models/RegisterDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Register a new user
     * @returns ApiResponse User registered successfully
     * @throws ApiError
     */
    public static register({
        requestBody,
    }: {
        /**
         * User registration data
         */
        requestBody: RegisterDto,
    }): CancelablePromise<ApiResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Email already exists`,
                422: `Validation error`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Login user and get JWT token
     * @returns ApiResponse User logged in successfully
     * @throws ApiError
     */
    public static login({
        requestBody,
    }: {
        /**
         * User login credentials
         */
        requestBody: LoginDto,
    }): CancelablePromise<ApiResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Wrong credentials`,
                422: `Validation error`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Logout user and invalidate token
     * @returns ApiResponse User logged out successfully
     * @throws ApiError
     */
    public static logout(): CancelablePromise<ApiResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/logout',
            errors: {
                401: `Authentication required`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get current user
     * @returns ApiResponse Current user retrieved successfully
     * @throws ApiError
     */
    public static getCurrentUser(): CancelablePromise<ApiResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/current',
            errors: {
                401: `Authentication required`,
                500: `Internal server error`,
            },
        });
    }
}
