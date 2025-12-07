/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUserDto } from '../models/CreateUserDto';
import type { MenuResponseDto } from '../models/MenuResponseDto';
import type { UpdateSelfDto } from '../models/UpdateSelfDto';
import type { UpdateUserDto } from '../models/UpdateUserDto';
import type { UserResponseDto } from '../models/UserResponseDto';
import type { UsersPage } from '../models/UsersPage';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Retrieves the personalized menu for the authenticated user.
     * @returns MenuResponseDto The personalized menu structure, including categories and cards, filtered by user permissions.
     * @throws ApiError
     */
    public static getMenuForMe(): CancelablePromise<MenuResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/me/menu',
        });
    }
    /**
     * Retrieves the profile of the currently authenticated user.
     * @returns UserResponseDto The user's profile information.
     * @throws ApiError
     */
    public static getMe(): CancelablePromise<UserResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/me',
        });
    }
    /**
     * Updates the profile of the currently authenticated user.
     * @returns UserResponseDto The updated user profile.
     * @throws ApiError
     */
    public static updateMe({
        requestBody,
    }: {
        /**
         * The data for updating the user's profile.
         */
        requestBody: UpdateSelfDto,
    }): CancelablePromise<UserResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/me',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieves a paginated list of all users. [ADMIN]
     * @returns UsersPage A paginated list of user details.
     * @throws ApiError
     */
    public static getUsers({
        page,
        limit,
        q,
        roleId,
        statusId,
    }: {
        /**
         * Optional: The page number for pagination.
         */
        page?: number,
        /**
         * Optional: The number of items per page for pagination.
         */
        limit?: number,
        /**
         * Optional: A search query string.
         */
        q?: string,
        /**
         * Optional: Filter by role ID.
         */
        roleId?: string,
        /**
         * Optional: Filter by status ID.
         */
        statusId?: string,
    }): CancelablePromise<UsersPage> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users',
            query: {
                'page': page,
                'limit': limit,
                'q': q,
                'roleId': roleId,
                'statusId': statusId,
            },
        });
    }
    /**
     * Creates a new user.
     * @returns UserResponseDto The newly created user's details.
     * @throws ApiError
     */
    public static createUser({
        requestBody,
    }: {
        /**
         * The data for creating the new user.
         */
        requestBody: CreateUserDto,
    }): CancelablePromise<UserResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieves a paginated list of users within a company. [MANAGER]
     * @returns UsersPage A paginated list of user details.
     * @throws ApiError
     */
    public static getUsersInCompany({
        companyId,
        page,
        limit,
        q,
        roleId,
        statusId,
    }: {
        /**
         * The ID of the company.
         */
        companyId: string,
        /**
         * Optional: The page number for pagination.
         */
        page?: number,
        /**
         * Optional: The number of items per page for pagination.
         */
        limit?: number,
        /**
         * Optional: A search query string.
         */
        q?: string,
        /**
         * Optional: Filter by role ID.
         */
        roleId?: string,
        /**
         * Optional: Filter by status ID.
         */
        statusId?: string,
    }): CancelablePromise<UsersPage> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/company/{companyId}',
            path: {
                'companyId': companyId,
            },
            query: {
                'page': page,
                'limit': limit,
                'q': q,
                'roleId': roleId,
                'statusId': statusId,
            },
        });
    }
    /**
     * Retrieves a single user's details by ID. [ADMIN]
     * @returns UserResponseDto The user's details.
     * @throws ApiError
     */
    public static getUserById({
        id,
    }: {
        /**
         * The ID of the user to retrieve.
         */
        id: string,
    }): CancelablePromise<UserResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Updates an existing user's details.
     * @returns UserResponseDto The updated user's details.
     * @throws ApiError
     */
    public static updateUser({
        id,
        requestBody,
    }: {
        /**
         * The ID of the user to update.
         */
        id: string,
        /**
         * The data for updating the user.
         */
        requestBody: UpdateUserDto,
    }): CancelablePromise<UserResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Deletes a user by anonymizing their data.
     * @returns void
     * @throws ApiError
     */
    public static deleteUser({
        id,
    }: {
        /**
         * The ID of the user to delete.
         */
        id: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/{id}',
            path: {
                'id': id,
            },
        });
    }
}
