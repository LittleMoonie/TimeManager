/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { AuthResponse } from '../models/AuthResponse';
import type { LoginUserRequest } from '../models/LoginUserRequest';
import type { RegisterResponse } from '../models/RegisterResponse';
import type { RegisterUserRequest } from '../models/RegisterUserRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Register a new user and organization
     * @returns RegisterResponse User registered successfully
     * @throws ApiError
     */
    public static registerUser({
        requestBody,
    }: {
        /**
         * User registration data
         */
        requestBody: RegisterUserRequest,
    }): CancelablePromise<RegisterResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/register',
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
     * @returns AuthResponse User logged in successfully
     * @throws ApiError
     */
    public static loginUser({
        requestBody,
    }: {
        /**
         * User login credentials
         */
        requestBody: LoginUserRequest,
    }): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/login',
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
    public static logoutUser(): CancelablePromise<ApiResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/logout',
            errors: {
                401: `Authentication required`,
                500: `Internal server error`,
            },
        });
    }
}
