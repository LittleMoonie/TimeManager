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

@Route("user-statuses")
@Tags("User Statuses")
@Security("jwt")
@Service()
export class UserStatusController extends Controller {
  constructor(private userStatusService: UserStatusService) {
    super();
  }

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
    await this.checkPermission(request.user, "create_user_status");
    const userStatus =
      await this.userStatusService.createUserStatus(createUserStatusDto);
    return userStatus;
  }

  @Get("/{id}")
  public async getUserStatus(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<UserStatusResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    // Check if the user has permission to get user statuses
    await this.checkPermission(request.user, "get_user_status");
    return this.userStatusService.getUserStatusById(id);
  }

  @Get("/")
  public async getAllUserStatuses(
    @Request() request: ExpressRequest,
  ): Promise<UserStatusResponseDto[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    // Check if the user has permission to get user statuses
    await this.checkPermission(request.user, "get_user_status");
    return this.userStatusService.getAllUserStatuses();
  }

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
    await this.checkPermission(request.user, "update_user_status");
    const updatedUserStatus = await this.userStatusService.updateUserStatus(
      id,
      updateUserStatusDto,
    );
    return updatedUserStatus;
  }

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
    await this.checkPermission(request.user, "delete_user_status");
    await this.userStatusService.deleteUserStatus(id);
  }

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
