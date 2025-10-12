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
  Query,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { Service } from "typedi";

import { UserService } from "../../Services/User/UserService";
import { CreateUserDto, UpdateUserDto } from "../../Dtos/Users/UserDto";
import { UserResponseDto } from "../../Dtos/Users/UserResponseDto";
import User from "../../Entities/Users/User";

type UsersPage = {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
};

/**
 * @summary Controller for company-scoped user management.
 * @tags Users
 * @security jwt
 */
@Route("users")
@Tags("Users")
@Security("jwt")
@Service()
export class UserController extends Controller {
  constructor(private readonly userService: UserService) {
    super();
  }

  /**
   * @summary Retrieves a paginated list of users within the authenticated user's company.
   * @param request The Express request object, containing user information.
   * @param page Optional: The page number for pagination.
   * @param limit Optional: The number of items per page for pagination.
   * @returns A paginated list of user details.
   * @throws {ForbiddenError} If the current user does not have 'list_users' permission.
   */
  @Get("/")
  public async listUsers(
    @Request() request: ExpressRequest,
    @Query() page?: number,
    @Query() limit?: number,
  ): Promise<UsersPage> {
    const me = request.user as User;
    return this.userService.listUsers(me.companyId, me, { page, limit });
  }

  /**
   * @summary Retrieves a single user's details by ID within the authenticated user's company.
   * @param id The ID of the user to retrieve.
   * @param request The Express request object, containing user information.
   * @returns The user's details.
   * @throws {ForbiddenError} If the current user does not have 'view_user' permission and is not the target user.
   * @throws {NotFoundError} If the user is not found within the specified company.
   */
  @Get("/{id}")
  public async getUserById(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<UserResponseDto> {
    const me = request.user as User;
    return this.userService.getUser(me.companyId, id, me);
  }

  /**
   * @summary Creates a new user within the authenticated user's company.
   * @param createUserDto The data for creating the new user.
   * @param request The Express request object, containing user information.
   * @returns The newly created user's details.
   * @throws {ForbiddenError} If the current user does not have 'create_user' permission.
   * @throws {UnprocessableEntityError} If validation fails, the email already exists, or an invalid roleId is provided.
   */
  @Post("/")
  public async createUser(
    @Body() createUserDto: CreateUserDto,
    @Request() request: ExpressRequest,
  ): Promise<UserResponseDto> {
    const me = request.user as User;
    return this.userService.createUser(me.companyId, me, createUserDto);
  }

  /**
   * @summary Updates an existing user's details within the authenticated user's company.
   * @param id The ID of the user to update.
   * @param updateUserDto The data for updating the user.
   * @param request The Express request object, containing user information.
   * @returns The updated user's details.
   * @throws {ForbiddenError} If the current user lacks permission or attempts to change restricted fields for themselves.
   * @throws {UnprocessableEntityError} If validation fails, or an invalid roleId/statusId is provided.
   * @throws {NotFoundError} If the user is not found.
   */
  @Put("/{id}")
  public async updateUser(
    @Path() id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() request: ExpressRequest,
  ): Promise<UserResponseDto> {
    const me = request.user as User;
    return this.userService.updateUser(me.companyId, id, me, updateUserDto);
  }

  /**
   * @summary Soft-deletes a user within the authenticated user's company.
   * @param id The ID of the user to soft-delete.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves upon successful soft-deletion.
   * @throws {ForbiddenError} If the current user does not have 'delete_user' permission.
   * @throws {NotFoundError} If the user is not found.
   */
  @Delete("/{id}")
  public async deleteUser(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.userService.softDeleteUser(me.companyId, id, me);
  }
}
