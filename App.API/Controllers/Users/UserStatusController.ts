import { Body, Controller, Get, Post, Put, Delete, Route, Tags, Path, Security } from 'tsoa';
import { Service } from 'typedi';

import { UserStatusService } from '../../Services/Users/UserStatusService';
import {
  CreateUserStatusDto,
  UserStatusResponseDto,
  UpdateUserStatusDto,
} from '../../Dtos/Users/UserStatusDto';

/**
 * @summary Controller for managing user statuses (global catalog).
 * @tags User Statuses
 * @security jwt
 */
@Route('user-statuses')
@Tags('User Statuses')
@Security('jwt')
@Service()
export class UserStatusController extends Controller {
  constructor(private readonly userStatusService: UserStatusService) {
    super();
  }

  /**
   * @summary Creates a new user status.
   * @param dto The data for creating the user status.
   * @returns The newly created user status.
   * @throws {UnprocessableEntityError} If validation fails or a user status with the same code already exists.
   */
  @Post('/')
  public async createUserStatus(@Body() dto: CreateUserStatusDto): Promise<UserStatusResponseDto> {
    return this.userStatusService.createUserStatus(dto);
  }

  /**
   * @summary Retrieves a user status by its ID.
   * @param id The ID of the user status to retrieve.
   * @returns The user status details.
   * @throws {NotFoundError} If the user status is not found.
   */
  @Get('/{id}')
  public async getUserStatus(@Path() id: string): Promise<UserStatusResponseDto | null> {
    return this.userStatusService.getUserStatusById(id);
  }

  /**
   * @summary Retrieves all user statuses.
   * @returns An array of user status details.
   */
  @Get('/')
  public async listUserStatuses(): Promise<UserStatusResponseDto[]> {
    return this.userStatusService.listUserStatuses();
  }

  /**
   * @summary Updates an existing user status.
   * @param id The ID of the user status to update.
   * @param dto The data for updating the user status.
   * @returns The updated user status details.
   * @throws {NotFoundError} If the user status to update is not found.
   * @throws {UnprocessableEntityError} If validation fails or an attempt is made to change the code to one that already exists.
   */
  @Put('/{id}')
  public async updateUserStatus(
    @Path() id: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<UserStatusResponseDto> {
    return this.userStatusService.updateUserStatus(id, dto);
  }

  /**
   * @summary Soft-deletes a user status.
   * @param id The ID of the user status to soft-delete.
   * @returns A Promise that resolves upon successful soft-deletion.
   * @throws {NotFoundError} If the user status to soft-delete is not found.
   */
  @Delete('/{id}')
  public async deleteUserStatus(@Path() id: string): Promise<void> {
    await this.userStatusService.softDeleteUserStatus(id);
  }
}
