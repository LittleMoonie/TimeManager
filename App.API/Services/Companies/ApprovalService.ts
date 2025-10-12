import { Service } from "typedi";
import { validate } from "class-validator";

import { LeaveRequestRepository } from "@/Repositories/Companies/LeaveRequestRepository";
import { LeaveRequest, LeaveRequestStatus } from "@/Entities/Companies/LeaveRequest";
import { ForbiddenError, UnprocessableEntityError } from "@/Errors/HttpErrors";
import User from "@/Entities/Users/User";
import { RolePermissionService } from "@/Services/RoleService/RolePermissionService";
import { UpdateLeaveRequestDto } from "@/Dtos/Companies/CompanyDto";

@Service()
export class ApprovalService {
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

  /** Approve a leave request (RBAC: approve_leave_request). */
  async approve(
    actingUser: User,
    companyId: string,
    leaveRequestId: string,
  ): Promise<LeaveRequest> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, "approve_leave_request"))) {
      throw new ForbiddenError("User does not have permission to approve leave requests.");
    }

    const lr = await this.leaveRequestRepository.getLeaveRequestById(companyId, leaveRequestId);
    if (lr.status === LeaveRequestStatus.APPROVED) return lr;

    const updated = await this.leaveRequestRepository.update(lr.id, {
      status: LeaveRequestStatus.APPROVED,
      // don't send null for string validator; omit field to clear via persistence rule if needed
    } as UpdateLeaveRequestDto);

    return updated!;
  }

  /** Reject a leave request (RBAC: approve_leave_request). */
  async reject(
    actingUser: User,
    companyId: string,
    leaveRequestId: string,
    rejectionReason: string,
  ): Promise<LeaveRequest> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, "approve_leave_request"))) {
      throw new ForbiddenError("User does not have permission to reject leave requests.");
    }

    const payload: UpdateLeaveRequestDto = {
      status: LeaveRequestStatus.REJECTED,
      rejectionReason: (rejectionReason || "").trim(),
    };
    await this.ensureValidation(payload);

    const lr = await this.leaveRequestRepository.getLeaveRequestById(companyId, leaveRequestId);
    const updated = await this.leaveRequestRepository.update(lr.id, payload);
    return updated!;
  }
}
