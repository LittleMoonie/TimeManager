/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUserStatusDto } from '../models/CreateUserStatusDto';
import type { UpdateUserStatusDto } from '../models/UpdateUserStatusDto';
import type { UserStatusResponseDto } from '../models/UserStatusResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserStatusesService {
  /**
   * Creates a new user status.
   * @returns UserStatusResponseDto The newly created user status.
   * @throws ApiError
   */
  public static createUserStatus({
    requestBody,
  }: {
    /**
     * The data for creating the user status.
     */
    requestBody: CreateUserStatusDto;
  }): CancelablePromise<UserStatusResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/user-statuses',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Retrieves all user statuses.
   * @returns UserStatusResponseDto An array of user status details.
   * @throws ApiError
   */
  public static listUserStatuses(): CancelablePromise<Array<UserStatusResponseDto>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/user-statuses',
    });
  }
  /**
   * Retrieves a user status by its ID.
   * @returns any The user status details.
   * @throws ApiError
   */
  public static getUserStatus({
    id,
  }: {
    /**
     * The ID of the user status to retrieve.
     */
    id: string;
  }): CancelablePromise<UserStatusResponseDto | null> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/user-statuses/{id}',
      path: {
        id: id,
      },
    });
  }
  /**
   * Updates an existing user status.
   * @returns UserStatusResponseDto The updated user status details.
   * @throws ApiError
   */
  public static updateUserStatus({
    id,
    requestBody,
  }: {
    /**
     * The ID of the user status to update.
     */
    id: string;
    /**
     * The data for updating the user status.
     */
    requestBody: UpdateUserStatusDto;
  }): CancelablePromise<UserStatusResponseDto> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/user-statuses/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Soft-deletes a user status.
   * @returns void
   * @throws ApiError
   */
  public static deleteUserStatus({
    id,
  }: {
    /**
     * The ID of the user status to soft-delete.
     */
    id: string;
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/user-statuses/{id}',
      path: {
        id: id,
      },
    });
  }
}
