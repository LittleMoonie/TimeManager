import { Request as ExpressRequest } from 'express';
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
} from 'tsoa';
import { Service } from 'typedi';

import { MenuResponseDto } from '../../Dtos/Menu/MenuDto';
import { CreateUserDto, UpdateUserDto, UpdateSelfDto } from '../../Dtos/Users/UserDto';
import { UserResponseDto } from '../../Dtos/Users/UserResponseDto';
import User from '../../Entities/Users/User';
import { MenuService } from '../../Services/Menu/MenuService';
import { UserService } from '../../Services/Users/UserService';

type UsersPage = {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
};

/**
 * @summary Controller for user management.
 * @tags Users
 * @security jwt
 */
@Route('users')
@Tags('Users')
@Security('jwt')
@Service()
export class UserController extends Controller {
  constructor(
    private readonly userService: UserService,
    private readonly menuService: MenuService,
  ) {
    super();
  }

  /**
   * @summary Retrieves the personalized menu for the authenticated user.
   * @param request The Express request object, containing user information.
   * @returns The personalized menu structure, including categories and cards, filtered by user permissions.
   */
  @Get('/me/menu')
  public async getMenuForMe(@Request() request: ExpressRequest): Promise<MenuResponseDto> {
    const me = request.user as User;
    return this.menuService.getMenuForUser(me.companyId, me);
  }

  /**
   * @summary Retrieves the profile of the currently authenticated user.
   * @param request The Express request object, containing user information.
   * @returns The user's profile information.
   */
  @Get('/me')
  public async getMe(@Request() request: ExpressRequest): Promise<UserResponseDto> {
    const me = request.user as User;
    return this.userService.getCurrentUser(me);
  }

  /**
   * @summary Updates the profile of the currently authenticated user.
   * @param updateSelfDto The data for updating the user's profile.
   * @param request The Express request object, containing user information.
   * @returns The updated user profile.
   */
  @Put('/me')
  public async updateMe(
    @Body() updateSelfDto: UpdateSelfDto,
    @Request() request: ExpressRequest,
  ): Promise<UserResponseDto> {
    const me = request.user as User;
    return this.userService.updateProfile(updateSelfDto, me);
  }

  /**
   * @summary Retrieves a paginated list of all users. [ADMIN]
   * @param request The Express request object, containing user information.
   * @param page Optional: The page number for pagination.
   * @param limit Optional: The number of items per page for pagination.
   * @param q Optional: A search query string.
   * @param roleId Optional: Filter by role ID.
   * @param statusId Optional: Filter by status ID.
   * @returns A paginated list of user details.
   */
  @Get('/')
  public async getUsers(
    @Request() request: ExpressRequest,
    @Query() page?: number,
    @Query() limit?: number,
    @Query() q?: string,
    @Query() roleId?: string,
    @Query() statusId?: string,
  ): Promise<UsersPage> {
    const me = request.user as User;
    return this.userService.getUsers({ page, limit, q, roleId, statusId }, me);
  }

  /**
   * @summary Retrieves a paginated list of users within a company. [MANAGER]
   * @param companyId The ID of the company.
   * @param request The Express request object, containing user information.
   * @param page Optional: The page number for pagination.
   * @param limit Optional: The number of items per page for pagination.
   * @param q Optional: A search query string.
   * @param roleId Optional: Filter by role ID.
   * @param statusId Optional: Filter by status ID.
   * @returns A paginated list of user details.
   */
  @Get('/company/{companyId}')
  public async getUsersInCompany(
    @Path() companyId: string,
    @Request() request: ExpressRequest,
    @Query() page?: number,
    @Query() limit?: number,
    @Query() q?: string,
    @Query() roleId?: string,
    @Query() statusId?: string,
  ): Promise<UsersPage> {
    const me = request.user as User;
    return this.userService.getUsersInCompany(companyId, { page, limit, q, roleId, statusId }, me);
  }

  /**
   * @summary Retrieves a single user's details by ID. [ADMIN]
   * @param id The ID of the user to retrieve.
   * @param request The Express request object, containing user information.
   * @returns The user's details.
   */
  @Get('/{id}')
  public async getUserById(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<UserResponseDto> {
    const me = request.user as User;
    return this.userService.getUserById(id, me);
  }

  /**
   * @summary Creates a new user.
   * @param createUserDto The data for creating the new user.
   * @param request The Express request object, containing user information.
   * @returns The newly created user's details.
   */
  @Post('/')
  public async createUser(
    @Body() createUserDto: CreateUserDto,
    @Request() request: ExpressRequest,
  ): Promise<UserResponseDto> {
    const me = request.user as User;
    return this.userService.createUser(createUserDto, me);
  }

  /**
   * @summary Updates an existing user's details.
   * @param id The ID of the user to update.
   * @param updateUserDto The data for updating the user.
   * @param request The Express request object, containing user information.
   * @returns The updated user's details.
   */
  @Put('/{id}')
  public async updateUser(
    @Path() id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() request: ExpressRequest,
  ): Promise<UserResponseDto> {
    const me = request.user as User;
    return this.userService.updateUser(id, updateUserDto, me);
  }

  /**
   * @summary Deletes a user by anonymizing their data.
   * @param id The ID of the user to delete.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves upon successful deletion.
   */
  @Delete('/{id}')
  public async deleteUser(@Path() id: string, @Request() request: ExpressRequest): Promise<void> {
    const me = request.user as User;
    await this.userService.deleteUser(id, me);
  }
}
