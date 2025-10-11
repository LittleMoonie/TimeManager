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

@Route("permissions")
@Tags("Permissions")
@Service()
export class PermissionController extends Controller {

  constructor(private permissionService: PermissionService  ) {
    super();
  }

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
    const { id: userId, companyId } = request.user;
    const permission = await this.permissionService.createPermission(
      companyId,
      userId,
      requestBody,
    );
    this.setStatus(201);
    return permission;
  }

  @Get("/{id}")
  @Security("jwt", ["admin"])
  public async getPermission(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<PermissionResponse> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    return this.permissionService.getPermissionById(companyId, id);
  }

  @Get("/")
  @Security("jwt", ["admin"])
  public async getAllPermissions(
    @Request() request: ExpressRequest,
  ): Promise<PermissionResponse[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    return this.permissionService.getAllPermissions(companyId);
  }

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
    const { id: userId, companyId } = request.user;
    return this.permissionService.updatePermission(
      companyId,
      userId,
      id,
      requestBody,
    );
  }

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
    const { id: userId, companyId } = request.user;
    await this.permissionService.deletePermission(companyId, userId, id);
  }
}
