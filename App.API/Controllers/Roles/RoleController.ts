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

import { RoleService } from "@/Services/RoleService/RoleService";
import { CreateRoleDto, UpdateRoleDto } from "@/Dtos/Roles/RoleDto";
import { Role } from "@/Entities/Roles/Role";
import User from "@/Entities/Users/User";

/**
 * @summary Manage roles (company-scoped)
 * @tags Roles
 * @security jwt
 */
@Route("roles")
@Tags("Roles")
@Service()
export class RoleController extends Controller {
  constructor(private readonly roleService: RoleService) {
    super();
  }

  /** Create a role */
  @Post("/")
  @Security("jwt", ["admin"])
  @SuccessResponse("201", "Role created successfully")
  public async createRole(
    @Body() body: CreateRoleDto,
    @Request() request: ExpressRequest,
  ): Promise<Role> {
    const me = request.user as User;
    const role = await this.roleService.createRole(me.companyId, me, body);
    this.setStatus(201);
    return role;
  }

  /** Get a role by id */
  @Get("/{id}")
  @Security("jwt", ["admin"])
  public async getRole(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Role> {
    const me = request.user as User;
    return this.roleService.getRoleById(me.companyId, id, me);
  }

  /** List all roles in my company */
  @Get("/")
  @Security("jwt", ["admin"])
  public async listRoles(
    @Request() request: ExpressRequest,
  ): Promise<Role[]> {
    const me = request.user as User;
    return this.roleService.listRoles(me.companyId, me);
  }

  /** Update a role */
  @Put("/{id}")
  @Security("jwt", ["admin"])
  public async updateRole(
    @Path() id: string,
    @Body() body: UpdateRoleDto,
    @Request() request: ExpressRequest,
  ): Promise<Role> {
    const me = request.user as User;
    return this.roleService.updateRole(me.companyId, id, me, body);
  }

  /** Delete (soft) a role */
  @Delete("/{id}")
  @Security("jwt", ["admin"])
  @SuccessResponse("200", "Role deleted successfully")
  public async deleteRole(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.roleService.deleteRole(me.companyId, id, me);
  }

  /** Add a permission to a role */
  @Post("/{roleId}/permissions/{permissionId}")
  @Security("jwt", ["admin"])
  @SuccessResponse("201", "Permission added to role successfully")
  public async addPermissionToRole(
    @Path() roleId: string,
    @Path() permissionId: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.roleService.assignPermissionToRole(me.companyId, roleId, permissionId, me);
    this.setStatus(201);
  }

  /** Remove a permission from a role */
  @Delete("/{roleId}/permissions/{permissionId}")
  @Security("jwt", ["admin"])
  @SuccessResponse("200", "Permission removed from role successfully")
  public async removePermissionFromRole(
    @Path() roleId: string,
    @Path() permissionId: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.roleService.removePermissionFromRole(me.companyId, roleId, permissionId, me);
  }
}
