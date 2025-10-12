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
import { UserService } from "../../Services/User/UserService";
import { UserDto } from "../../Dtos/Users/UserDto";
import { CreateUserDto } from "../../Dtos/Users/CreateUserDto";
import { UpdateUserDto } from "../../Dtos/Users/UpdateUserDto";
import { RolePermissionService } from "../../Services/RoleService/RolePermissionService";
import { Service } from "typedi";
import User from "../../Entities/Users/User";

/**
 * @summary Controller for managing user accounts.
 * @tags Users
 * @security jwt
 */
@Route("users")
@Tags("Users")
@Security("jwt")
@Service()
export class UserController extends Controller {
  constructor(
    private userService: UserService,
    private rolePermissionService: RolePermissionService,
  ) {
    super();
  }

  /**
   * @summary Retrieves all users within the authenticated user's company.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<UserResponseDto[]>} An array of user details.
   */
  @Get("/")
  public async getAllUsers(
    @Request() request: ExpressRequest,
  ): Promise<UserDto[]> {
    const { companyId } = request.user as UserDto;
    return this.userService.getAllUsers(companyId);
  }

  /**
   * @summary Retrieves a single user by their ID.
   * @param {string} id - The ID of the user to retrieve.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<UserResponseDto>} The user details.
   */
  @Get("{id}")
  public async getUserById(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<UserDto> {
    const { id: userId } = request.user as UserDto;;
    return this.userService.getUserById(userId);
  }

  /**
   * @summary Creates a new user account.
   * @param {CreateUserDto} createUserDto - The data for creating the user.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<UserResponseDto>} The newly created user's details.
   */
  @Post("/")
  @Security("jwt", ["admin"])
  public async createUser(
    @Body() createUserDto: CreateUserDto,
    @Request() request: ExpressRequest,
  ): Promise<UserDto> {
    const { companyId } = request.user as UserDto;

    // Check if the user has permission to create users
    await this.rolePermissionService.checkPermission(
      request.user as User,
      "create_user",
    );
    const user = await this.userService.createUser(
      companyId,
      request.user as User,
      createUserDto,
    );
    return user;
  }

  /**
   * @summary Updates an existing user account.
   * @param {string} id - The ID of the user to update.
   * @param {UpdateUserDto} updateUserDto - The data for updating the user.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<UserResponseDto>} The updated user details.
   */
  @Put("{id}")
  @Security("jwt", ["admin"])
  public async updateUser(
    @Path() id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() request: ExpressRequest,
  ): Promise<UserDto> {
    const { companyId } = request.user as UserDto;
    const updatedUser = await this.userService.updateUser(
      companyId,
      id,
      request.user as User,
      updateUserDto,
    );
    return updatedUser;
  }

  /**
   * @summary Deletes a user account by its ID.
   * @param {string} id - The ID of the user to delete.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<void>} Nothing is returned upon successful deletion.
   */
  @Delete("{id}")
  @Security("jwt", ["admin"])
  public async deleteUser(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const { companyId } = request.user as UserDto;
    await this.userService.deleteUser(companyId, id, request.user as User);
  }
}
