import { Request as ExpressRequest } from 'express';
import { Body, Controller, Post, Delete, Route, Tags, Path, Security, Request } from 'tsoa';
import { Service } from 'typedi';

import { CreateRolePermissionDto, RolePermissionResponseDto } from '../../Dtos/Roles/RoleDto';
import User from '../../Entities/Users/User';
import { RolePermissionService } from '../../Services/RoleService/RolePermissionService';

/**
 * @summary Controller for managing role-permission links within a company.
 * @tags Role Permissions
 * @security jwt
 */
@Route('role-permissions')
@Tags('Role Permissions')
@Security('jwt')
@Service()
export class RolePermissionController extends Controller {
  constructor(private readonly rolePermissionService: RolePermissionService) {
    super();
  }

  /**
   * @summary Creates a new role-permission association.
   * @param dto The data for creating the role-permission association.
   * @param request The Express request object, containing user information.
   * @returns The newly created role-permission association.
   * @throws {ForbiddenError} If the current user does not have 'create_role_permission' permission.
   */
  @Post('/')
  @Security('jwt', ['admin'])
  public async createRolePermission(
    @Body() dto: CreateRolePermissionDto,
    @Request() request: ExpressRequest,
  ): Promise<RolePermissionResponseDto> {
    const me = request.user as User;
    return this.rolePermissionService.createRolePermission(me, me.companyId, dto);
  }

  /**
   * @summary Deletes a role-permission association by its ID.
   * @param id The ID of the role-permission association to delete.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves upon successful deletion.
   * @throws {ForbiddenError} If the current user does not have 'delete_role_permission' permission.
   * @throws {NotFoundError} If the role-permission association is not found or does not belong to the specified company.
   */
  @Delete('/{id}')
  @Security('jwt', ['admin'])
  public async deleteRolePermission(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.rolePermissionService.deleteRolePermission(me, me.companyId, id);
  }
}
