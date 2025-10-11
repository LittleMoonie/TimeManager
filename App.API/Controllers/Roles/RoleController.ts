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
    const { id: userId, companyId } = request.user;
    const role = await this.roleService.createRole(
      companyId,
      userId,
      requestBody,
    );
    this.setStatus(201);
    return role;
  }

  @Get("/{id}")
  @Security("jwt", ["admin"])
  public async getRole(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<RoleResponse> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    return this.roleService.getRoleById(companyId, id);
  }

  @Get("/")
  @Security("jwt", ["admin"])
  public async getAllRoles(
    @Request() request: ExpressRequest,
  ): Promise<RoleResponse[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    return this.roleService.getAllRoles(companyId);
  }

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
    const { id: userId, companyId } = request.user;
    return this.roleService.updateRole(companyId, userId, id, requestBody);
  }

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
    const { id: userId, companyId } = request.user;
    await this.roleService.deleteRole(companyId, userId, id);
  }

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
    const { id: userId, companyId } = request.user;
    await this.roleService.addPermissionToRole(
      companyId,
      userId,
      roleId,
      permissionId,
    );
  }

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
    const { id: userId, companyId } = request.user;
    await this.roleService.removePermissionFromRole(
      companyId,
      userId,
      roleId,
      permissionId,
    );
  }
}
