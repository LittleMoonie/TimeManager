import {
  Body,
  Controller,
  Post,
  Route,
  Tags,
  SuccessResponse,
  Security,
  Request,
  Get,
  Path,
  Put,
  Delete,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { Service } from "typedi";

import { PermissionService } from "@/Services/RoleService/PermissionService";
import { CreatePermissionDto, UpdatePermissionDto } from "@/Dtos/Roles/RoleDto";
import { Permission } from "@/Entities/Roles/Permission";
import User from "@/Entities/Users/User";

/**
 * @summary Controller for managing permissions within a company.
 * @tags Permissions
 * @security jwt
 */
@Route("permissions")
@Tags("Permissions")
@Service()
export class PermissionController extends Controller {
  constructor(private readonly permissionService: PermissionService) {
    super();
  }

  /**
   * @summary Creates a new permission.
   * @param body The data for creating the permission.
   * @param request The Express request object, containing user information.
   * @returns The newly created permission.
   * @throws {ForbiddenError} If the current user does not have 'create_permission' permission.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   */
  @Post("/")
  @Security("jwt", ["admin"])
  @SuccessResponse("201", "Permission created successfully")
  public async createPermission(
    @Body() body: CreatePermissionDto,
    @Request() request: ExpressRequest,
  ): Promise<Permission> {
    const me = request.user as User;
    const perm = await this.permissionService.createPermission(
      me.companyId,
      me,
      body,
    );
    this.setStatus(201);
    return perm;
  }

  /**
   * @summary Retrieves a permission by its ID.
   * @param id The ID of the permission to retrieve.
   * @param request The Express request object, containing user information.
   * @returns The permission details.
   * @throws {NotFoundError} If the permission is not found or does not belong to the specified company.
   */
  @Get("/{id}")
  @Security("jwt", ["admin"])
  public async getPermission(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Permission> {
    const me = request.user as User;
    return this.permissionService.getPermissionById(me.companyId, id);
  }

  /**
   * @summary Retrieves all permissions in the authenticated user's company.
   * @param request The Express request object, containing user information.
   * @returns An array of permissions.
   */
  @Get("/")
  @Security("jwt", ["admin"])
  public async getAllPermissions(
    @Request() request: ExpressRequest,
  ): Promise<Permission[]> {
    const me = request.user as User;
    return this.permissionService.getAllPermissions(me.companyId);
  }

  /**
   * @summary Updates an existing permission.
   * @param id The ID of the permission to update.
   * @param body The data for updating the permission.
   * @param request The Express request object, containing user information.
   * @returns The updated permission details.
   * @throws {ForbiddenError} If the current user does not have 'update_permission' permission.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   * @throws {NotFoundError} If the permission is not found or not found after update.
   */
  @Put("/{id}")
  @Security("jwt", ["admin"])
  public async updatePermission(
    @Path() id: string,
    @Body() body: UpdatePermissionDto,
    @Request() request: ExpressRequest,
  ): Promise<Permission> {
    const me = request.user as User;
    return this.permissionService.updatePermission(
      me.companyId,
      me,
      id,
      body,
    );
  }

  /**
   * @summary Deletes a permission by its ID.
   * @param id The ID of the permission to delete.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves upon successful deletion.
   * @throws {ForbiddenError} If the current user does not have 'delete_permission' permission.
   * @throws {NotFoundError} If the permission is not found.
   */
  @Delete("/{id}")
  @Security("jwt", ["admin"])
  @SuccessResponse("200", "Permission deleted successfully")
  public async deletePermission(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.permissionService.deletePermission(me.companyId, me, id);
  }
}
