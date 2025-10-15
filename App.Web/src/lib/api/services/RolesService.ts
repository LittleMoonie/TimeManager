/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateRoleDto } from '../models/CreateRoleDto';
import type { Role } from '../models/Role';
import type { UpdateRoleDto } from '../models/UpdateRoleDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RolesService {
    /**
     * Creates a new role.
     * @returns Role Role created successfully
     * @throws ApiError
     */
    public static createRole({
        requestBody,
    }: {
        /**
         * The data for creating the role.
         */
        requestBody: CreateRoleDto,
    }): CancelablePromise<Role> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/roles',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieves all roles in the authenticated user's company.
     * @returns Role An array of roles.
     * @throws ApiError
     */
    public static listRoles(): CancelablePromise<Array<Role>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/roles',
        });
    }
    /**
     * Retrieves a role by its ID.
     * @returns Role The role details.
     * @throws ApiError
     */
    public static getRole({
        id,
    }: {
        /**
         * The ID of the role to retrieve.
         */
        id: string,
    }): CancelablePromise<Role> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/roles/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Updates an existing role.
     * @returns Role The updated role details.
     * @throws ApiError
     */
    public static updateRole({
        id,
        requestBody,
    }: {
        /**
         * The ID of the role to update.
         */
        id: string,
        /**
         * The data for updating the role.
         */
        requestBody: UpdateRoleDto,
    }): CancelablePromise<Role> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/roles/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Soft deletes a role.
     * @returns any Role deleted successfully
     * @throws ApiError
     */
    public static deleteRole({
        id,
    }: {
        /**
         * The ID of the role to soft delete.
         */
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/roles/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Assigns a permission to a role.
     * @returns any Permission added to role successfully
     * @throws ApiError
     */
    public static addPermissionToRole({
        roleId,
        permissionId,
    }: {
        /**
         * The ID of the role to assign the permission to.
         */
        roleId: string,
        /**
         * The ID of the permission to assign.
         */
        permissionId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/roles/{roleId}/permissions/{permissionId}',
            path: {
                'roleId': roleId,
                'permissionId': permissionId,
            },
        });
    }
    /**
     * Removes a permission from a role.
     * @returns any Permission removed from role successfully
     * @throws ApiError
     */
    public static removePermissionFromRole({
        roleId,
        permissionId,
    }: {
        /**
         * The ID of the role to remove the permission from.
         */
        roleId: string,
        /**
         * The ID of the permission to remove.
         */
        permissionId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/roles/{roleId}/permissions/{permissionId}',
            path: {
                'roleId': roleId,
                'permissionId': permissionId,
            },
        });
    }
}
