/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePermissionDto } from '../models/CreatePermissionDto';
import type { Permission } from '../models/Permission';
import type { UpdatePermissionDto } from '../models/UpdatePermissionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PermissionsService {
  /**
   * Creates a new permission.
   * @returns Permission Permission created successfully
   * @throws ApiError
   */
  public static createPermission({
    requestBody,
  }: {
    /**
     * The data for creating the permission.
     */
    requestBody: CreatePermissionDto;
  }): CancelablePromise<Permission> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/permissions',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Retrieves all permissions in the authenticated user's company.
   * @returns Permission An array of permissions.
   * @throws ApiError
   */
  public static getAllPermissions(): CancelablePromise<Array<Permission>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/permissions',
    });
  }
  /**
   * Retrieves a permission by its ID.
   * @returns Permission The permission details.
   * @throws ApiError
   */
  public static getPermission({
    id,
  }: {
    /**
     * The ID of the permission to retrieve.
     */
    id: string;
  }): CancelablePromise<Permission> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/permissions/{id}',
      path: {
        id: id,
      },
    });
  }
  /**
   * Updates an existing permission.
   * @returns Permission The updated permission details.
   * @throws ApiError
   */
  public static updatePermission({
    id,
    requestBody,
  }: {
    /**
     * The ID of the permission to update.
     */
    id: string;
    /**
     * The data for updating the permission.
     */
    requestBody: UpdatePermissionDto;
  }): CancelablePromise<Permission> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/permissions/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Deletes a permission by its ID.
   * @returns any Permission deleted successfully
   * @throws ApiError
   */
  public static deletePermission({
    id,
  }: {
    /**
     * The ID of the permission to delete.
     */
    id: string;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/permissions/{id}',
      path: {
        id: id,
      },
    });
  }
}
