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
import { RolePermissionService } from "../../Services/User/RolePermissionService";
import {
  CreateRolePermissionDto,
  RolePermissionResponseDto,
} from "../../Dtos/Users/RolePermissionDto";
import { AuthenticationError } from "../../Errors/HttpErrors";
import { Service } from "typedi";

@Route("role-permissions")
@Tags("Role Permissions")
@Security("jwt")
@Service()
export class RolePermissionController extends Controller {
  constructor(private rolePermissionService: RolePermissionService) {
    super();
  }

  @Post("/")
  @Security("jwt", ["admin"])
  public async createRolePermission(
    @Body() createRolePermissionDto: CreateRolePermissionDto,
    @Request() request: ExpressRequest,
  ): Promise<RolePermissionResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    // In a real application, you would check if the user has permission to create role permissions
    const rolePermission =
      await this.rolePermissionService.createRolePermission(
        request.user,
        companyId,
        createRolePermissionDto,
      );
    return rolePermission;
  }

  @Delete("/{id}")
  @Security("jwt", ["admin"])
  public async deleteRolePermission(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    // In a real application, you would check if the user has permission to delete role permissions
    await this.rolePermissionService.deleteRolePermission(
      request.user,
      companyId,
      id,
    );
  }
}
