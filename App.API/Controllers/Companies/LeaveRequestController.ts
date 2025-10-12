import {
  Body, Controller, Get, Post, Put, Delete, Route, Tags, Path, Security, Request,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { Service } from "typedi";

import { LeaveRequestService } from "@/Services/Companies/LeaveRequestService";
import { CreateLeaveRequestDto, UpdateLeaveRequestDto } from "@/Dtos/Companies/CompanyDto";
import { LeaveRequest } from "@/Entities/Companies/LeaveRequest";
import { UserService } from "@/Services/User/UserService";
import { UserResponseDto } from "@/Dtos/Users/UserResponseDto";

/**
 * @summary Controller for managing leave requests.
 * @tags Leave Requests
 * @security jwt
 */
@Route("leave-requests")
@Tags("Leave Requests")
@Security("jwt")
@Service()
export class LeaveRequestController extends Controller {
  constructor(
    private leaveRequestService: LeaveRequestService,
    private userService: UserService,
  ) {
    super();
  }

  /**
   * @summary Creates a new leave request.
   * @param createLeaveRequestDto The data for creating the leave request.
   * @param request The Express request object, containing user information.
   * @returns The newly created leave request.
   * @throws {ForbiddenError} If the acting user does not have permission to create leave requests for other users.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   */
  @Post("/")
  public async createLeaveRequest(
    @Body() createLeaveRequestDto: CreateLeaveRequestDto,
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequest> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(userId);
    return this.leaveRequestService.createLeaveRequest(
      actingUser,
      actingUser.companyId,
      createLeaveRequestDto,
    );
  }

  /**
   * @summary Retrieves a single leave request by its ID.
   * @param id The ID of the leave request to retrieve.
   * @param request The Express request object, containing user information.
   * @returns The leave request details.
   * @throws {NotFoundError} If the leave request is not found.
   */
  @Get("/{id}")
  public async getLeaveRequest(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequest> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(userId);
    return this.leaveRequestService.getLeaveRequestById(actingUser.companyId, id);
  }

  /**
   * @summary Retrieves all leave requests for the authenticated user's company.
   * @param request The Express request object, containing user information.
   * @returns An array of leave requests.
   */
  @Get("/")
  public async getAllLeaveRequests(
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequest[]> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(userId);
    return this.leaveRequestService.getAllLeaveRequests(actingUser.companyId);
  }

  /**
   * @summary Updates an existing leave request.
   * @param id The ID of the leave request to update.
   * @param updateLeaveRequestDto The data for updating the leave request.
   * @param request The Express request object, containing user information.
   * @returns The updated leave request details.
   * @throws {ForbiddenError} If the acting user does not have permission to update leave requests for other users.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   * @throws {NotFoundError} If the leave request is not found.
   */
  @Put("/{id}")
  public async updateLeaveRequest(
    @Path() id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequest> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(userId);
    return this.leaveRequestService.updateLeaveRequest(
      actingUser,
      actingUser.companyId,
      id,
      updateLeaveRequestDto,
    );
  }

  /**
   * @summary Deletes a leave request by its ID.
   * @param id The ID of the leave request to delete.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves upon successful deletion.
   * @throws {ForbiddenError} If the acting user does not have permission to delete leave requests for other users.
   * @throws {NotFoundError} If the leave request is not found.
   */
  @Delete("/{id}")
  public async deleteLeaveRequest(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(userId);
    await this.leaveRequestService.deleteLeaveRequest(
      actingUser,
      actingUser.companyId,
      id,
    );
  }
}
