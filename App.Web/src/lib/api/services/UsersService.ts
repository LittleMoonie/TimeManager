/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUserDto } from '../models/CreateUserDto';
import type { UpdateUserDto } from '../models/UpdateUserDto';
import type { UserResponseDto } from '../models/UserResponseDto';
import type { UsersPage } from '../models/UsersPage';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
  /**
   * Retrieves a paginated list of users within the authenticated user's company.
   * @returns UsersPage A paginated list of user details.
   * @throws ApiError
   */
  public static listUsers({
    page,
    limit,
  }: {
    /**
     * Optional: The page number for pagination.
     */
    page?: number;
    /**
     * Optional: The number of items per page for pagination.
     */
    limit?: number;
  }): CancelablePromise<UsersPage> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/users',
      query: {
        page: page,
        limit: limit,
      },
    });
  }
  /**
   * Creates a new user within the authenticated user's company.
   * @returns UserResponseDto The newly created user's details.
   * @throws ApiError
   */
  public static createUser({
    requestBody,
  }: {
    /**
     * The data for creating the new user.
     */
    requestBody: CreateUserDto;
  }): CancelablePromise<UserResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/users',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Retrieves a single user's details by ID within the authenticated user's company.
   * @returns UserResponseDto The user's details.
   * @throws ApiError
   */
  public static getUserById({
    id,
  }: {
    /**
     * The ID of the user to retrieve.
     */
    id: string;
  }): CancelablePromise<UserResponseDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/users/{id}',
      path: {
        id: id,
      },
    });
  }
  /**
   * Updates an existing user's details within the authenticated user's company.
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
    id: string;
    /**
     * The data for updating the user.
     */
    requestBody: UpdateUserDto;
  }): CancelablePromise<UserResponseDto> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/users/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Soft-deletes a user within the authenticated user's company.
   * @returns void
   * @throws ApiError
   */
  public static deleteUser({
    id,
  }: {
    /**
     * The ID of the user to soft-delete.
     */
    id: string;
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/users/{id}',
      path: {
        id: id,
      },
    });
  }
}
