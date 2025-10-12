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
} from "tsoa";
import { Service } from "typedi";

import { UserStatusService } from "@/Services/Users/UserStatusService";
import {
  CreateUserStatusDto,
  UserStatusResponseDto,
  UpdateUserStatusDto,
} from "@/Dtos/Users/UserStatusDto";

/**
 * @summary Manage User Statuses (global catalog).
 * @tags User Statuses
 * @security jwt
 */
@Route("user-statuses")
@Tags("User Statuses")
@Security("jwt")
@Service()
export class UserStatusController extends Controller {
  constructor(private readonly userStatusService: UserStatusService) {
    super();
  }

  /**
   * @summary Create a new status.
   */
  @Post("/")
  public async createUserStatus(
    @Body() dto: CreateUserStatusDto,
  ): Promise<UserStatusResponseDto> {
    return this.userStatusService.createUserStatus(dto);
  }

  /**
   * @summary Get a status by id.
   */
  @Get("/{id}")
  public async getUserStatus(
    @Path() id: string,
  ): Promise<UserStatusResponseDto | null> {
    return this.userStatusService.getUserStatusById(id);
  }

  /**
   * @summary List all statuses.
   */
  @Get("/")
  public async listUserStatuses(): Promise<UserStatusResponseDto[]> {
    return this.userStatusService.listUserStatuses();
  }

  /**
   * @summary Update a status.
   */
  @Put("/{id}")
  public async updateUserStatus(
    @Path() id: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<UserStatusResponseDto> {
    return this.userStatusService.updateUserStatus(id, dto);
  }

  /**
   * @summary Soft-delete a status.
   */
  @Delete("/{id}")
  public async deleteUserStatus(@Path() id: string): Promise<void> {
    await this.userStatusService.softDeleteUserStatus(id);
  }
}
