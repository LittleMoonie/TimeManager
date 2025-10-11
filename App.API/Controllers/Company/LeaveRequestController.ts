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

  @Post("/")
  public async createLeaveRequest(
    @Body() createLeaveRequestDto: CreateLeaveRequestDto,
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequestResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
    const actingUser = await this.userService.getUserById(companyId, userId);

    const leaveRequest = await this.leaveRequestService.createLeaveRequest(
      actingUser,
      companyId,
      createLeaveRequestDto,
    );
    return leaveRequest;
  }

  @Get("/{id}")
  public async getLeaveRequest(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequestResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    return this.leaveRequestService.getLeaveRequestById(companyId, id);
  }

  @Get("/")
  public async getAllLeaveRequests(
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequestResponseDto[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    return this.leaveRequestService.getAllLeaveRequests(companyId);
  }

  @Put("/{id}")
  public async updateLeaveRequest(
    @Path() id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequestResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
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

  @Delete("/{id}")
  public async deleteLeaveRequest(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
    const actingUser = await this.userService.getUserById(companyId, userId);

    await this.leaveRequestService.deleteLeaveRequest(
      actingUser,
      companyId,
      id,
    );
  }
}
