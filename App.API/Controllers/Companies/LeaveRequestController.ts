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
 * @summary Manage leave requests
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

  /** Create */
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

  /** Get one */
  @Get("/{id}")
  public async getLeaveRequest(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequest> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(userId);
    return this.leaveRequestService.getLeaveRequestById(actingUser.companyId, id);
  }

  /** List mine (company) */
  @Get("/")
  public async getAllLeaveRequests(
    @Request() request: ExpressRequest,
  ): Promise<LeaveRequest[]> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(userId);
    return this.leaveRequestService.getAllLeaveRequests(actingUser.companyId);
  }

  /** Update */
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

  /** Delete */
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
