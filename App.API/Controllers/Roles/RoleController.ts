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
import { AuthenticationError } from "../../Errors/HttpErrors";
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
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Post("/")
  @Security("jwt", ["admin"])
  @SuccessResponse("201", "Role created successfully")
  public async createRole(
    @Body() requestBody: CreateRoleDto,
    @Request() request: ExpressRequest,
  ): Promise<RoleResponse> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
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
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Get("/{id}")
  @Security("jwt", ["admin"])
  public async getRole(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<RoleResponse> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user as UserDto;
    return this.roleService.getRoleById(companyId, id);
  }

  /**
   * @summary Retrieves all roles for the authenticated user's company.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<RoleResponse[]>} An array of roles.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Get("/")
  @Security("jwt", ["admin"])
  public async getAllRoles(
    @Request() request: ExpressRequest,
  ): Promise<RoleResponse[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user as UserDto;
    return this.roleService.getAllRoles(companyId);
  }

  /**
   * @summary Updates an existing role.
   * @param {string} id - The ID of the role to update.
   * @param {UpdateRoleDto} requestBody - The data for updating the role.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<RoleResponse>} The updated role details.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Put("/{id}")
  @Security("jwt", ["admin"])
  public async updateRole(
    @Path() id: string,
    @Body() requestBody: UpdateRoleDto,
    @Request() request: ExpressRequest,
  ): Promise<RoleResponse> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    return this.roleService.updateRole(companyId, userId, id, requestBody);
  }

  /**
   * @summary Deletes a role by its ID.
   * @param {string} id - The ID of the role to delete.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<void>} Nothing is returned upon successful deletion.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Delete("/{id}")
  @Security("jwt", ["admin"])
  @SuccessResponse("200", "Role deleted successfully")
  public async deleteRole(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    await this.roleService.deleteRole(companyId, userId, id);
  }

  /**
   * @summary Adds a permission to a specific role.
   * @param {string} roleId - The ID of the role to which the permission will be added.
   * @param {string} permissionId - The ID of the permission to add.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<void>} Nothing is returned upon successful addition.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Post("/{roleId}/permissions/{permissionId}")
  @Security("jwt", ["admin"])
  @SuccessResponse("201", "Permission added to role successfully")
  public async addPermissionToRole(
    @Path() roleId: string,
    @Path() permissionId: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    await this.roleService.addPermissionToRole(
      companyId,
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
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Delete("/{roleId}/permissions/{permissionId}")
  @Security("jwt", ["admin"])
  @SuccessResponse("200", "Permission removed from role successfully")
  public async removePermissionFromRole(
    @Path() roleId: string,
    @Path() permissionId: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    await this.roleService.removePermissionFromRole(
      companyId,
      userId,
      roleId,
      permissionId,
    );
  }
}
