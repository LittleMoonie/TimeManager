import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Route,
  Tags,
  Path,
  Security,
  Request,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { UserStatusService } from "../../Services/User/UserStatusService";
import {
  CreateUserStatusDto,
  UserStatusResponseDto,
  UpdateUserStatusDto,
} from "../../Dtos/Users/UserStatusDto";
import { AuthenticationError } from "../../Errors/HttpErrors";
import User from "../../Entities/Users/User";
import { Service } from "typedi";
import { UserDto } from "../../Dtos/Users/UserDto";

/**
 * @summary Controller for managing user statuses.
 * @tags User Statuses
 * @security jwt
 */
@Route("user-statuses")
@Tags("User Statuses")
@Security("jwt")
@Service()
export class UserStatusController extends Controller {
  constructor(private userStatusService: UserStatusService) {
    super();
  }

  /**
   * @summary Creates a new user status.
   * @param {CreateUserStatusDto} createUserStatusDto - The data for creating the user status.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<UserStatusResponseDto>} The newly created user status.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Post("/")
  @Security("jwt", ["admin"])
  public async createUserStatus(
    @Body() createUserStatusDto: CreateUserStatusDto,
    @Request() request: ExpressRequest,
  ): Promise<UserStatusResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    // Check if the user has permission to create user statuses
    await this.checkPermission(request.user as User, "create_user_status");
    const userStatus =
      await this.userStatusService.createUserStatus(createUserStatusDto);
    return userStatus;
  }

  /**
   * @summary Retrieves a single user status by its ID.
   * @param {string} id - The ID of the user status to retrieve.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<UserStatusResponseDto>} The user status details.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Get("/{id}")
  public async getUserStatus(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<UserStatusResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    // Check if the user has permission to get user statuses
    await this.checkPermission(request.user as User, "get_user_status");
    return this.userStatusService.getUserStatusById(id);
  }

  /**
   * @summary Retrieves all user statuses.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<UserStatusResponseDto[]>} An array of user statuses.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Get("/")
  public async getAllUserStatuses(
    @Request() request: ExpressRequest,
  ): Promise<UserStatusResponseDto[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    // Check if the user has permission to get user statuses
    await this.checkPermission(request.user as User, "get_user_status");
    return this.userStatusService.getAllUserStatuses();
  }

  /**
   * @summary Updates an existing user status.
   * @param {string} id - The ID of the user status to update.
   * @param {UpdateUserStatusDto} updateUserStatusDto - The data for updating the user status.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<UserStatusResponseDto>} The updated user status details.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Put("/{id}")
  @Security("jwt", ["admin"])
  public async updateUserStatus(
    @Path() id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
    @Request() request: ExpressRequest,
  ): Promise<UserStatusResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    // Check if the user has permission to update user statuses
    await this.checkPermission(request.user as User, "update_user_status");
    const updatedUserStatus = await this.userStatusService.updateUserStatus(
      id,
      updateUserStatusDto,
    );
    return updatedUserStatus;
  }

  /**
   * @summary Deletes a user status by its ID.
   * @param {string} id - The ID of the user status to delete.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<void>} Nothing is returned upon successful deletion.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Delete("/{id}")
  @Security("jwt", ["admin"])
  public async deleteUserStatus(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    // Check if the user has permission to delete user statuses
    await this.checkPermission(request.user as User, "delete_user_status");
    await this.userStatusService.deleteUserStatus(id);
  }

  /**
   * @summary Checks if the authenticated user has a specific permission.
   * @param {User} user - The authenticated user object.
   * @param {string} permissionName - The name of the permission to check.
   * @returns {Promise<boolean>} True if the user has the permission, false otherwise.
   */
  private async checkPermission(
    user: User,
    permissionName: string,
  ): Promise<boolean> {
    if (!user.role || !user.role.rolePermissions) {
      return false;
    }
    const permissions = user.role.rolePermissions.map(
      (rp) => rp.permission.name,
    );
    return permissions.includes(permissionName);
  }
}
