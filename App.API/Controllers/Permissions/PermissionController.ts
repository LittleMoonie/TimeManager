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
import { PermissionService } from "../../Services/PermissionService/PermissionService";
import {
  CreatePermissionDto,
  PermissionResponse,
  UpdatePermissionDto,
} from "../../Dtos/Users/PermissionDto";
import { AuthenticationError } from "../../Errors/HttpErrors";
import { Service } from "typedi";
import { UserDto } from "../../Dtos/Users/UserDto";

/**
 * @summary Controller for managing permissions within the system.
 * @tags Permissions
 */
@Route("permissions")
@Tags("Permissions")
@Service()
export class PermissionController extends Controller {

  constructor(private permissionService: PermissionService  ) {
    super();
  }

  /**
   * @summary Creates a new permission.
   * @param {CreatePermissionDto} requestBody - The data for creating the permission.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<PermissionResponse>} The newly created permission.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Post("/")
  @Security("jwt", ["admin"])
  @SuccessResponse("201", "Permission created successfully")
  public async createPermission(
    @Body() requestBody: CreatePermissionDto,
    @Request() request: ExpressRequest,
  ): Promise<PermissionResponse> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    const permission = await this.permissionService.createPermission(
      companyId,
      userId,
      requestBody,
    );
    this.setStatus(201);
    return permission;
  }

  /**
   * @summary Retrieves a single permission by its ID.
   * @param {string} id - The ID of the permission to retrieve.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<PermissionResponse>} The permission details.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Get("/{id}")
  @Security("jwt", ["admin"])
  public async getPermission(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<PermissionResponse> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user as UserDto;
    return this.permissionService.getPermissionById(companyId, id);
  }

  /**
   * @summary Retrieves all permissions for the authenticated user's company.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<PermissionResponse[]>} An array of permissions.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Get("/")
  @Security("jwt", ["admin"])
  public async getAllPermissions(
    @Request() request: ExpressRequest,
  ): Promise<PermissionResponse[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user as UserDto;
    return this.permissionService.getAllPermissions(companyId);
  }

  /**
   * @summary Updates an existing permission.
   * @param {string} id - The ID of the permission to update.
   * @param {UpdatePermissionDto} requestBody - The data for updating the permission.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<PermissionResponse>} The updated permission details.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Put("/{id}")
  @Security("jwt", ["admin"])
  public async updatePermission(
    @Path() id: string,
    @Body() requestBody: UpdatePermissionDto,
    @Request() request: ExpressRequest,
  ): Promise<PermissionResponse> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    return this.permissionService.updatePermission(
      companyId,
      userId,
      id,
      requestBody,
    );
  }

  /**
   * @summary Deletes a permission by its ID.
   * @param {string} id - The ID of the permission to delete.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {void} Nothing is returned upon successful deletion.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Delete("/{id}")
  @Security("jwt", ["admin"])
  @SuccessResponse("200", "Permission deleted successfully")
  public async deletePermission(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    await this.permissionService.deletePermission(companyId, userId, id);
  }
}
