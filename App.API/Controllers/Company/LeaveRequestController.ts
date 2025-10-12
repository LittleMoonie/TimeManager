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
import { LeaveRequestService } from "../../Services/Company/LeaveRequestService";
import {
  CreateLeaveRequestDto,
  LeaveRequestResponseDto,
  UpdateLeaveRequestDto,
} from "../../Dtos/Company/LeaveRequestDto";
import { AuthenticationError } from "../../Errors/HttpErrors";
import { UserService } from "../../Services/User/UserService";
import { Service } from "typedi";
import { UserDto } from "../../Dtos/Users/UserDto";

/**
 * @summary Controller for managing leave requests within a company.
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
   * @param {CreateLeaveRequestDto} createLeaveRequestDto - The data for creating the leave request.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<LeaveRequestResponseDto>} The newly created leave request.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Post("/")
  public async createLeaveRequest(
    @Body() createLeaveRequestDto: CreateLeaveRequestDto,
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequestResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    const actingUser = await this.userService.getUserById(companyId, userId);

    const leaveRequest = await this.leaveRequestService.createLeaveRequest(
      actingUser,
      companyId,
      createLeaveRequestDto,
    );
    return leaveRequest;
  }

  /**
   * @summary Retrieves a single leave request by its ID.
   * @param {string} id - The ID of the leave request to retrieve.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<LeaveRequestResponseDto>} The leave request details.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Get("/{id}")
  public async getLeaveRequest(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequestResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user as UserDto;
    return this.leaveRequestService.getLeaveRequestById(companyId, id);
  }

  /**
   * @summary Retrieves all leave requests for the authenticated user's company.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<LeaveRequestResponseDto[]>} An array of leave requests.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Get("/")
  public async getAllLeaveRequests(
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequestResponseDto[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user as UserDto;
    return this.leaveRequestService.getAllLeaveRequests(companyId);
  }

  /**
   * @summary Updates an existing leave request.
   * @param {string} id - The ID of the leave request to update.
   * @param {UpdateLeaveRequestDto} updateLeaveRequestDto - The data for updating the leave request.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<LeaveRequestResponseDto>} The updated leave request details.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Put("/{id}")
  public async updateLeaveRequest(
    @Path() id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequestResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    const actingUser = await this.userService.getUserById(companyId, userId);

    const updatedLeaveRequest =
      await this.leaveRequestService.updateLeaveRequest(
        actingUser,
        companyId,
        id,
        updateLeaveRequestDto,
      );
    return updatedLeaveRequest;
  }

  /**
   * @summary Deletes a leave request by its ID.
   * @param {string} id - The ID of the leave request to delete.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<void>} Nothing is returned upon successful deletion.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Delete("/{id}")
  public async deleteLeaveRequest(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    const actingUser = await this.userService.getUserById(companyId, userId);

    await this.leaveRequestService.deleteLeaveRequest(
      actingUser,
      companyId,
      id,
    );
  }
}
