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
import { RolePermissionService } from "../../Services/RoleService/RolePermissionService";
import {
  CreateRolePermissionDto,
  RolePermissionResponseDto,
} from "../../Dtos/Roles/RolePermissionDto";
import { Service } from "typedi";
import { UserDto } from "../../Dtos/Users/UserDto";
import User from "../../Entities/Users/User";

/**
 * @summary Controller for managing role permissions.
 * @tags Role Permissions
 * @security jwt
 */
@Route("role-permissions")
@Tags("Role Permissions")
@Security("jwt")
@Service()
export class RolePermissionController extends Controller {
  constructor(private rolePermissionService: RolePermissionService) {
    super();
  }

  /**
   * @summary Creates a new role permission.
   * @param {CreateRolePermissionDto} createRolePermissionDto - The data for creating the role permission.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<RolePermissionResponseDto>} The newly created role permission.
   */
  @Post("/")
  @Security("jwt", ["admin"])
  public async createRolePermission(
    @Body() createRolePermissionDto: CreateRolePermissionDto,
    @Request() request: ExpressRequest,
  ): Promise<RolePermissionResponseDto> {
    const { companyId } = request.user as UserDto;
    // In a real application, you would check if the user has permission to create role permissions
    const rolePermission =
      await this.rolePermissionService.createRolePermission(
        request.user as User,
        companyId,
        createRolePermissionDto,
      );
    return rolePermission;
  }

  /**
   * @summary Deletes a role permission by its ID.
   * @param {string} id - The ID of the role permission to delete.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<void>} Nothing is returned upon successful deletion.
   */
  @Delete("/{id}")
  @Security("jwt", ["admin"])
  public async deleteRolePermission(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const { companyId } = request.user as UserDto;
    // In a real application, you would check if the user has permission to delete role permissions
    await this.rolePermissionService.deleteRolePermission(
      request.user as User,
      companyId,
      id,
    );
  }
}
