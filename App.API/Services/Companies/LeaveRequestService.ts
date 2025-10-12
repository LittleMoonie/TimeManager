import { Service } from "typedi";
import { validate } from "class-validator";

import { LeaveRequestRepository } from "@/Repositories/Companies/LeaveRequestRepository";
import { CreateLeaveRequestDto, UpdateLeaveRequestDto } from "@/Dtos/Companies/CompanyDto";
import { LeaveRequest } from "@/Entities/Companies/LeaveRequest";
import { ForbiddenError, UnprocessableEntityError } from "@/Errors/HttpErrors";
import User from "@/Entities/Users/User";
import { RolePermissionService } from "@/Services/RoleService/RolePermissionService";

@Service()
export class LeaveRequestService {
  constructor(
    private readonly leaveRequestRepository: LeaveRequestRepository,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map(e => e.toString()).join(", ")}`
      );
    }
  }

  async createLeaveRequest(
    actingUser: User,
    companyId: string,
    dto: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    await this.ensureValidation(dto);

    // Users can create their own; managers can create for others
    if (
      actingUser.id !== dto.userId &&
      !(await this.rolePermissionService.checkPermission(actingUser, "create_other_leave_request"))
    ) {
      throw new ForbiddenError("User does not have permission to create leave requests for other users.");
    }

    return this.leaveRequestRepository.create({ companyId, ...dto });
  }

  async updateLeaveRequest(
    actingUser: User,
    companyId: string,
    leaveRequestId: string,
    dto: UpdateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    await this.ensureValidation(dto);

    const leaveRequest = await this.leaveRequestRepository.getLeaveRequestById(companyId, leaveRequestId);

    if (
      actingUser.id !== leaveRequest.userId &&
      !(await this.rolePermissionService.checkPermission(actingUser, "update_other_leave_request"))
    ) {
      throw new ForbiddenError("User does not have permission to update leave requests for other users.");
    }

    const updated = await this.leaveRequestRepository.update(leaveRequestId, dto);
    return updated!;
  }

  async deleteLeaveRequest(
    actingUser: User,
    companyId: string,
    leaveRequestId: string,
  ): Promise<void> {
    const leaveRequest = await this.leaveRequestRepository.getLeaveRequestById(companyId, leaveRequestId);

    if (
      actingUser.id !== leaveRequest.userId &&
      !(await this.rolePermissionService.checkPermission(actingUser, "delete_other_leave_request"))
    ) {
      throw new ForbiddenError("User does not have permission to delete leave requests for other users.");
    }

    await this.leaveRequestRepository.softDelete(leaveRequestId);
  }
}
