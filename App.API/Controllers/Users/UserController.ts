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
import { AuthenticationError } from "../../Errors/HttpErrors";
import { UserResponseDto } from "../../Dtos/Users/UserDto";
import { CreateUserDto } from "../../Dtos/Users/CreateUserDto";
import { UpdateUserDto } from "../../Dtos/Users/UpdateUserDto";
import { RolePermissionService } from "../../Services/User/RolePermissionService";
import { Service } from "typedi";

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

  @Get("/")
  public async getAllUsers(
    @Request() request: ExpressRequest,
  ): Promise<UserResponseDto[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    return this.userService.getAllUsers(companyId);
  }

  @Get("{id}")
  public async getUserById(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<UserResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    return this.userService.getUserById(companyId, id);
  }

  @Post("/")
  @Security("jwt", ["admin"])
  public async createUser(
    @Body() createUserDto: CreateUserDto,
    @Request() request: ExpressRequest,
  ): Promise<UserResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;

    // Check if the user has permission to create users
    await this.rolePermissionService.checkPermission(
      request.user,
      "create_user",
    );
    const user = await this.userService.createUser(
      companyId,
      request.user,
      createUserDto,
    );
    return user;
  }

  @Put("{id}")
  @Security("jwt", ["admin"])
  public async updateUser(
    @Path() id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() request: ExpressRequest,
  ): Promise<UserResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    const updatedUser = await this.userService.updateUser(
      companyId,
      id,
      request.user,
      updateUserDto,
    );
    return updatedUser;
  }

  @Delete("{id}")
  @Security("jwt", ["admin"])
  public async deleteUser(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    await this.userService.deleteUser(companyId, id, request.user);
  }
}
