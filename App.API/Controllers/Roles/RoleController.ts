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
import { RoleService } from "../../Services/RoleService/RoleService";
import {
  CreateRoleDto,
  RoleResponse,
  UpdateRoleDto,
} from "../../Dtos/Users/RoleDto";
import { UserService } from "../../Services/User/UserService";
import { Service } from "typedi";
import { UserDto } from "../../Dtos/Users/UserDto";

/**
 * @summary Controller for managing user roles and their associated permissions.
 * @tags Roles
 */
@Route("roles")
@Tags("Roles")
@Service()
export class RoleController extends Controller {
  constructor(
    private roleService: RoleService,
    private userService: UserService,
  ) {
    super();
  }

  /**
   * @summary Creates a new role.
   * @param {CreateRoleDto} requestBody - The data for creating the role.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<RoleResponse>} The newly created role.
   */
  @Post("/")
  @Security("jwt", ["admin"])
  @SuccessResponse("201", "Role created successfully")
  public async createRole(
    @Body() requestBody: CreateRoleDto,
    @Request() request: ExpressRequest,
  ): Promise<RoleResponse> {
    const { id: userId, companyId } = request.user as UserDto;
    const role = await this.roleService.createRole(
      companyId,
      userId,
      requestBody,
    );
    this.setStatus(201);
    return role;
  }

  /**
   * @summary Retrieves a single role by its ID.
   * @param {string} id - The ID of the role to retrieve.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<RoleResponse>} The role details.
   */
  @Get("/{id}")
  @Security("jwt", ["admin"])
  public async getRole(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<RoleResponse> {
    const { id: userId } = request.user as UserDto;
    await this.userService.getUserById(userId);
    return this.roleService.getRoleById(id);
  }

  /**
   * @summary Retrieves all roles for the authenticated user's company.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<RoleResponse[]>} An array of roles.
   */
  @Get("/")
  @Security("jwt", ["admin"])
  public async getAllRoles(
    @Request() request: ExpressRequest,
  ): Promise<RoleResponse[]> {
    const { id: userId } = request.user as UserDto;
    const user = await this.userService.getUserById(userId);
    return this.roleService.getAllRoles(user.companyId);
  }

  /**
   * @summary Updates an existing role.
   * @param {string} id - The ID of the role to update.
   * @param {UpdateRoleDto} requestBody - The data for updating the role.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<RoleResponse>} The updated role details.
   */
  @Put("/{id}")
  @Security("jwt", ["admin"])
  public async updateRole(
    @Path() id: string,
    @Body() requestBody: UpdateRoleDto,
    @Request() request: ExpressRequest,
  ): Promise<RoleResponse> {
    const { id: userId } = request.user as UserDto;
    const user = await this.userService.getUserById(userId);
    return this.roleService.updateRole(user.companyId, userId, id, requestBody);
  }

  /**
   * @summary Deletes a role by its ID.
   * @param {string} id - The ID of the role to delete.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<void>} Nothing is returned upon successful deletion.
   */
  @Delete("/{id}")
  @Security("jwt", ["admin"])
  @SuccessResponse("200", "Role deleted successfully")
  public async deleteRole(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const { id: userId } = request.user as UserDto;
    const user = await this.userService.getUserById(userId);
    await this.roleService.deleteRole(user.companyId, userId, id);
  }

  /**
   * @summary Adds a permission to a specific role.
   * @param {string} roleId - The ID of the role to which the permission will be added.
   * @param {string} permissionId - The ID of the permission to add.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<void>} Nothing is returned upon successful addition.
   */
  @Post("/{roleId}/permissions/{permissionId}")
  @Security("jwt", ["admin"])
  @SuccessResponse("201", "Permission added to role successfully")
  public async addPermissionToRole(
    @Path() roleId: string,
    @Path() permissionId: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const { id: userId } = request.user as UserDto;
    const user = await this.userService.getUserById(userId);
    await this.roleService.addPermissionToRole(
      user.companyId,
      userId,
      roleId,
      permissionId,
    );
  }

  /**
   * @summary Removes a permission from a specific role.
   * @param {string} roleId - The ID of the role from which the permission will be removed.
   * @param {string} permissionId - The ID of the permission to remove.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<void>} Nothing is returned upon successful removal.
   */
  @Delete("/{roleId}/permissions/{permissionId}")
  @Security("jwt", ["admin"])
  @SuccessResponse("200", "Permission removed from role successfully")
  public async removePermissionFromRole(
    @Path() roleId: string,
    @Path() permissionId: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const { id: userId } = request.user as UserDto;
    const user = await this.userService.getUserById(userId);
    await this.roleService.removePermissionFromRole(
      user.companyId,
      userId,
      roleId,
      permissionId,
    );
  }
}
