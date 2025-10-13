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
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { Service } from 'typedi';

import { RoleService } from '../../Services/RoleService/RoleService';
import { CreateRoleDto, UpdateRoleDto } from '../../Dtos/Roles/RoleDto';
import { Role } from '../../Entities/Roles/Role';
import User from '../../Entities/Users/User';

/**
 * @summary Controller for managing roles within a company.
 * @tags Roles
 * @security jwt
 */
@Route('roles')
@Tags('Roles')
@Service()
export class RoleController extends Controller {
  constructor(private readonly roleService: RoleService) {
    super();
  }

  /**
   * @summary Creates a new role.
   * @param body The data for creating the role.
   * @param request The Express request object, containing user information.
   * @returns The newly created role.
   * @throws {ForbiddenError} If the current user does not have 'create_role' permission.
   * @throws {UnprocessableEntityError} If validation fails or a role with the same name already exists in the company.
   */
  @Post('/')
  @Security('jwt', ['admin'])
  @SuccessResponse('201', 'Role created successfully')
  public async createRole(
    @Body() body: CreateRoleDto,
    @Request() request: ExpressRequest,
  ): Promise<Role> {
    const me = request.user as User;
    const role = await this.roleService.createRole(me.companyId, me, body);
    this.setStatus(201);
    return role;
  }

  /**
   * @summary Retrieves a role by its ID.
   * @param id The ID of the role to retrieve.
   * @param request The Express request object, containing user information.
   * @returns The role details.
   * @throws {NotFoundError} If the role is not found.
   * @throws {ForbiddenError} If the current user does not have access to the role's company.
   */
  @Get('/{id}')
  @Security('jwt', ['admin'])
  public async getRole(@Path() id: string, @Request() request: ExpressRequest): Promise<Role> {
    const me = request.user as User;
    return this.roleService.getRoleById(me.companyId, id, me);
  }

  /**
   * @summary Retrieves all roles in the authenticated user's company.
   * @param request The Express request object, containing user information.
   * @returns An array of roles.
   * @throws {ForbiddenError} If the current user does not have access to the specified company.
   */
  @Get('/')
  @Security('jwt', ['admin'])
  public async listRoles(@Request() request: ExpressRequest): Promise<Role[]> {
    const me = request.user as User;
    return this.roleService.listRoles(me.companyId, me);
  }

  /**
   * @summary Updates an existing role.
   * @param id The ID of the role to update.
   * @param body The data for updating the role.
   * @param request The Express request object, containing user information.
   * @returns The updated role details.
   * @throws {ForbiddenError} If the current user does not have 'update_role' permission or access to the role's company.
   * @throws {UnprocessableEntityError} If validation fails or an attempt is made to change the name to one that already exists.
   * @throws {NotFoundError} If the role to update is not found.
   */
  @Put('/{id}')
  @Security('jwt', ['admin'])
  public async updateRole(
    @Path() id: string,
    @Body() body: UpdateRoleDto,
    @Request() request: ExpressRequest,
  ): Promise<Role> {
    const me = request.user as User;
    return this.roleService.updateRole(me.companyId, id, me, body);
  }

  /**
   * @summary Soft deletes a role.
   * @param id The ID of the role to soft delete.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves upon successful deletion.
   * @throws {ForbiddenError} If the current user does not have 'delete_role' permission or access to the role's company.
   * @throws {NotFoundError} If the role to delete is not found.
   */
  @Delete('/{id}')
  @Security('jwt', ['admin'])
  @SuccessResponse('200', 'Role deleted successfully')
  public async deleteRole(@Path() id: string, @Request() request: ExpressRequest): Promise<void> {
    const me = request.user as User;
    await this.roleService.deleteRole(me.companyId, id, me);
  }

  /**
   * @summary Assigns a permission to a role.
   * @param roleId The ID of the role to assign the permission to.
   * @param permissionId The ID of the permission to assign.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves upon successful assignment.
   * @throws {ForbiddenError} If the current user does not have 'assign_role_permission' permission or access to the role's company.
   * @throws {NotFoundError} If the role is not found.
   */
  @Post('/{roleId}/permissions/{permissionId}')
  @Security('jwt', ['admin'])
  @SuccessResponse('201', 'Permission added to role successfully')
  public async addPermissionToRole(
    @Path() roleId: string,
    @Path() permissionId: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.roleService.assignPermissionToRole(me.companyId, roleId, permissionId, me);
    this.setStatus(201);
  }

  /**
   * @summary Removes a permission from a role.
   * @param roleId The ID of the role to remove the permission from.
   * @param permissionId The ID of the permission to remove.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves upon successful removal.
   * @throws {ForbiddenError} If the current user does not have 'remove_role_permission' permission or access to the role's company.
   * @throws {NotFoundError} If the role is not found.
   */
  @Delete('/{roleId}/permissions/{permissionId}')
  @Security('jwt', ['admin'])
  @SuccessResponse('200', 'Permission removed from role successfully')
  public async removePermissionFromRole(
    @Path() roleId: string,
    @Path() permissionId: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.roleService.removePermissionFromRole(me.companyId, roleId, permissionId, me);
  }
}
