import {
  Body,
  Controller,
  Post,
  Delete,
  Route,
  Tags,
  Path,
  Security,
  Request,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { Service } from "typedi";

import { RolePermissionService } from "@/Services/RoleService/RolePermissionService";
import {
  CreateRolePermissionDto,
  RolePermissionResponseDto,
} from "@/Dtos/Roles/RoleDto";
import User from "@/Entities/Users/User";

/**
 * @summary Manage role-permission links (company-scoped)
 * @tags Role Permissions
 * @security jwt
 */
@Route("role-permissions")
@Tags("Role Permissions")
@Security("jwt")
@Service()
export class RolePermissionController extends Controller {
  constructor(private readonly rolePermissionService: RolePermissionService) {
    super();
  }

  @Post("/")
  @Security("jwt", ["admin"])
  public async createRolePermission(
    @Body() dto: CreateRolePermissionDto,
    @Request() request: ExpressRequest,
  ): Promise<RolePermissionResponseDto> {
    const me = request.user as User;
    return this.rolePermissionService.createRolePermission(me, me.companyId, dto);
  }

  @Delete("/{id}")
  @Security("jwt", ["admin"])
  public async deleteRolePermission(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.rolePermissionService.deleteRolePermission(me, me.companyId, id);
  }
}
