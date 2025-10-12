import { Service } from "typedi";
import { validate } from "class-validator";

import { LeaveRequestRepository } from "@/Repositories/Companies/LeaveRequestRepository";
import { CreateLeaveRequestDto, UpdateLeaveRequestDto } from "@/Dtos/Companies/CompanyDto";
import { LeaveRequest } from "@/Entities/Companies/LeaveRequest";
import { ForbiddenError, NotFoundError, UnprocessableEntityError } from "@/Errors/HttpErrors";
import User from "@/Entities/Users/User";
import { RolePermissionService } from "@/Services/RoleService/RolePermissionService";

/**
 * @description Service layer for managing LeaveRequest entities. This service provides business logic
 * for leave request operations, including creation, updates, and deletion, with integrated permission checks.
 */
@Service()
export class LeaveRequestService {
  /**
   * @description Initializes the LeaveRequestService with necessary repositories and services.
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
        `Validation error: ${errors.map(e => e.toString()).join(", ")}`
      );
    }
  }
  
  /**
   * @description Gets a leave request by its ID.
   * @param leaveRequestId The unique identifier of the leave request to get.
   * @returns A Promise that resolves to the LeaveRequest entity.
   * @throws {NotFoundError} If the leave request is not found.
   */
  async getLeaveRequestById(companyId: string, leaveRequestId: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.getLeaveRequestById(companyId, leaveRequestId);
    if (!leaveRequest) throw new NotFoundError("Leave request not found");
    return leaveRequest;
  }

  /**
   * @description Gets all leave requests for a company.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to an array of LeaveRequest entities.
   */
  async getAllLeaveRequests(companyId: string): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.getAllLeaveRequests(companyId);
  }

  /**
   * @description Creates a new leave request for a user within a specified company.
   * Users can create their own leave requests. Managers can create leave requests for other users if they have the 'create_other_leave_request' permission.
   * @param actingUser The user performing the action.
   * @param companyId The unique identifier of the company.
   * @param dto The CreateLeaveRequestDto containing the details of the new leave request.
   * @returns A Promise that resolves to the newly created LeaveRequest entity.
   * @throws {ForbiddenError} If the acting user does not have permission to create leave requests for other users.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   */
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

  /**
   * @description Updates an existing leave request for a user within a specified company.
   * Users can update their own leave requests. Managers can update leave requests for other users if they have the 'update_other_leave_request' permission.
   * @param actingUser The user performing the action.
   * @param companyId The unique identifier of the company.
   * @param leaveRequestId The unique identifier of the leave request to update.
   * @param dto The UpdateLeaveRequestDto containing the updated details for the leave request.
   * @returns A Promise that resolves to the updated LeaveRequest entity.
   * @throws {ForbiddenError} If the acting user does not have permission to update leave requests for other users.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   * @throws {NotFoundError} If the leave request is not found.
   */
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

  /**
   * @description Soft deletes a leave request for a user within a specified company.
   * Users can delete their own leave requests. Managers can delete leave requests for other users if they have the 'delete_other_leave_request' permission.
   * @param actingUser The user performing the action.
   * @param companyId The unique identifier of the company.
   * @param leaveRequestId The unique identifier of the leave request to delete.
   * @returns A Promise that resolves when the soft deletion is complete.
   * @throws {ForbiddenError} If the acting user does not have permission to delete leave requests for other users.
   * @throws {NotFoundError} If the leave request is not found.
   */
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
