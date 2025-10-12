import { Service } from "typedi";
import { LeaveRequestRepository } from "../../Repositories/Companies/LeaveRequestRepository";
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
} from "../../Dtos/Company/LeaveRequestDto";
import { LeaveRequest } from "../../Entities/Companies/LeaveRequest";
import { NotFoundError, ForbiddenError } from "../../Errors/HttpErrors";
import User from "../../Entities/Users/User";
import { RolePermissionService } from "../User/RolePermissionService";

@Service()
export class LeaveRequestService {
  constructor(
    private leaveRequestRepository: LeaveRequestRepository,
    private rolePermissionService: RolePermissionService,
  ) {}

  public async createLeaveRequest(
    actingUser: User,
    companyId: string,
    createLeaveRequestDto: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    // Permission check: Users can create their own leave requests, managers can create for their team members
    if (
      actingUser.id !== createLeaveRequestDto.userId &&
      !(await this.rolePermissionService.checkPermission(
        actingUser,
        "create_other_leave_request",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to create leave requests for other users.",
      );
    }
    return this.leaveRequestRepository.create({
      companyId,
      ...createLeaveRequestDto,
    });
  }

  public async getLeaveRequestById(
    companyId: string,
    leaveRequestId: string,
  ): Promise<LeaveRequest> {
    const leaveRequest =
      await this.leaveRequestRepository.findById(leaveRequestId);
    if (!leaveRequest || leaveRequest.companyId !== companyId) {
      throw new NotFoundError("Leave request not found");
    }
    return leaveRequest;
  }

  public async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.findAll();
  }

  public async updateLeaveRequest(
    actingUser: User,
    companyId: string,
    leaveRequestId: string,
    updateLeaveRequestDto: UpdateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    // Permission check: Users can update their own leave requests, managers can update for their team members
    const leaveRequest = await this.getLeaveRequestById(
      companyId,
      leaveRequestId,
    );
    if (
      actingUser.id !== leaveRequest.userId &&
      !(await this.rolePermissionService.checkPermission(
        actingUser,
        "update_other_leave_request",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to update leave requests for other users.",
      );
    }
    const updatedLeaveRequest = await this.leaveRequestRepository.update(
      leaveRequestId,
      updateLeaveRequestDto,
    );
    return updatedLeaveRequest!;
  }

  public async deleteLeaveRequest(
    actingUser: User,
    companyId: string,
    leaveRequestId: string,
  ): Promise<void> {
    // Permission check: Users can delete their own leave requests, managers can delete for their team members
    const leaveRequest = await this.getLeaveRequestById(
      companyId,
      leaveRequestId,
    );
    if (
      actingUser.id !== leaveRequest.userId &&
      !(await this.rolePermissionService.checkPermission(
        actingUser,
        "delete_other_leave_request",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to delete leave requests for other users.",
      );
    }
    await this.leaveRequestRepository.softDelete(leaveRequestId);
  }
}
