/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateRolePermissionDto } from '../models/CreateRolePermissionDto';
import type { RolePermissionResponseDto } from '../models/RolePermissionResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RolePermissionsService {
  /**
   * Creates a new role-permission association.
   * @returns RolePermissionResponseDto The newly created role-permission association.
   * @throws ApiError
   */
  public static createRolePermission({
    requestBody,
  }: {
    /**
     * The data for creating the role-permission association.
     */
    requestBody: CreateRolePermissionDto;
  }): CancelablePromise<RolePermissionResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/role-permissions',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Deletes a role-permission association by its ID.
   * @returns void
   * @throws ApiError
   */
  public static deleteRolePermission({
    id,
  }: {
    /**
     * The ID of the role-permission association to delete.
     */
    id: string;
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/role-permissions/{id}',
      path: {
        id: id,
      },
    });
  }
}
