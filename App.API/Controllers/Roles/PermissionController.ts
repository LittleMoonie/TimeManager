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
 * @summary Manage permissions (company-scoped)
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

  /** Create a permission */
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

  /** Get a permission by id */
  @Get("/{id}")
  @Security("jwt", ["admin"])
  public async getPermission(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Permission> {
    const me = request.user as User;
    return this.permissionService.getPermissionById(me.companyId, id);
  }

  /** List all permissions in my company */
  @Get("/")
  @Security("jwt", ["admin"])
  public async getAllPermissions(
    @Request() request: ExpressRequest,
  ): Promise<Permission[]> {
    const me = request.user as User;
    return this.permissionService.getAllPermissions(me.companyId);
  }

  /** Update a permission */
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

  /** Delete a permission */
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
