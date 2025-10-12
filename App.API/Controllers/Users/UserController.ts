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

import { UserService } from "@/Services/User/UserService";
import {
  CreateUserDto,
  UpdateUserDto,
} from "@/Dtos/Users/UserDto";
import { UserResponseDto } from "@/Dtos/Users/UserResponseDto";
import User from "@/Entities/Users/User";

type UsersPage = {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
};

/**
 * @summary Company-scoped user management.
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
   * @summary Paginated users list (company-scoped).
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
   * @summary Get a single user (company-scoped).
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
   * @summary Create a user in my company.
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
   * @summary Update a user in my company.
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
   * @summary Soft-delete a user in my company.
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
