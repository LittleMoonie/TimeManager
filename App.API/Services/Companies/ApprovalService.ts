import { Service } from 'typedi';
import { validate } from 'class-validator';

import { LeaveRequestRepository } from '../../Repositories/Companies/LeaveRequestRepository';
import { LeaveRequest, LeaveRequestStatus } from '../../Entities/Companies/LeaveRequest';
import { ForbiddenError, UnprocessableEntityError } from '../../Errors/HttpErrors';
import User from '../../Entities/Users/User';
import { RolePermissionService } from '../../Services/RoleService/RolePermissionService';
import { UpdateLeaveRequestDto } from '../../Dtos/Companies/CompanyDto';

/**
 * @description Service layer for handling approval-related business logic, specifically for leave requests.
 * It integrates with LeaveRequestRepository and RolePermissionService to manage approval workflows and permissions.
 */
@Service()
export class ApprovalService {
  /**
   * @description Initializes the ApprovalService with necessary repositories and services.
   * @param leaveRequestRepository The repository for LeaveRequest entities.
   * @param rolePermissionService The service for checking user permissions.
   */
  constructor(
    private readonly leaveRequestRepository: LeaveRequestRepository,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  /**
   * @description Ensures that a given DTO (Data Transfer Object) is valid by performing class-validator validation.
   * @param dto The DTO object to validate.
   * @returns A Promise that resolves if validation passes.
   * @throws {UnprocessableEntityError} If validation fails, containing details of the validation errors.
   */
  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(', ')}`,
      );
    }
  }

  /**
   * @description Approves a leave request. Requires 'approve_leave_request' permission.
   * If the leave request is already approved, it returns the existing approved request.
   * @param actingUser The user performing the action.
   * @param companyId The unique identifier of the company.
   * @param leaveRequestId The unique identifier of the leave request to approve.
   * @returns A Promise that resolves to the approved LeaveRequest entity.
   * @throws {ForbiddenError} If the acting user does not have permission to approve leave requests.
   * @throws {NotFoundError} If the leave request is not found.
   */
  async approve(
    actingUser: User,
    companyId: string,
    leaveRequestId: string,
  ): Promise<LeaveRequest> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, 'approve_leave_request'))) {
      throw new ForbiddenError('User does not have permission to approve leave requests.');
    }

    const lr = await this.leaveRequestRepository.getLeaveRequestById(companyId, leaveRequestId);
    if (lr.status === LeaveRequestStatus.APPROVED) return lr;

    const updated = await this.leaveRequestRepository.update(lr.id, {
      status: LeaveRequestStatus.APPROVED,
      // don't send null for string validator; omit field to clear via persistence rule if needed
    } as UpdateLeaveRequestDto);

    return updated!;
  }

  /**
   * @description Rejects a leave request with a specified reason. Requires 'approve_leave_request' permission.
   * @param actingUser The user performing the action.
   * @param companyId The unique identifier of the company.
   * @param leaveRequestId The unique identifier of the leave request to reject.
   * @param rejectionReason The reason for rejecting the leave request.
   * @returns A Promise that resolves to the rejected LeaveRequest entity.
   * @throws {ForbiddenError} If the acting user does not have permission to reject leave requests.
   * @throws {UnprocessableEntityError} If validation of the rejection reason fails.
   * @throws {NotFoundError} If the leave request is not found.
   */
  async reject(
    actingUser: User,
    companyId: string,
    leaveRequestId: string,
    rejectionReason: string,
  ): Promise<LeaveRequest> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, 'approve_leave_request'))) {
      throw new ForbiddenError('User does not have permission to reject leave requests.');
    }

    const payload: UpdateLeaveRequestDto = {
      status: LeaveRequestStatus.REJECTED,
      rejectionReason: (rejectionReason || '').trim(),
    };
    await this.ensureValidation(payload);

    const lr = await this.leaveRequestRepository.getLeaveRequestById(companyId, leaveRequestId);
    const updated = await this.leaveRequestRepository.update(lr.id, payload);
    return updated!;
  }
}
