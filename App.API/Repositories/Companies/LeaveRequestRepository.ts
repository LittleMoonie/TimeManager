import { Service } from "typedi";
import { LeaveRequest } from "@/Entities/Companies/LeaveRequest";
import { BaseRepository } from "@/Repositories/BaseRepository";
import { NotFoundError } from "@/Errors/HttpErrors";

/**
 * @description Repository for managing LeaveRequest entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying leave requests within a company scope.
 */
@Service()
export class LeaveRequestRepository extends BaseRepository<LeaveRequest> {
  /**
   * @description Initializes the LeaveRequestRepository.
   * The constructor automatically passes the LeaveRequest entity to the BaseRepository.
   */
  constructor() {
    super(LeaveRequest);
  }

  /**
   * @description Retrieves a single leave request by its ID within a specific company.
   * @param companyId The unique identifier of the company.
   * @param leaveRequestId The unique identifier of the leave request.
   * @returns A Promise that resolves to the LeaveRequest entity.
   * @throws {NotFoundError} If the leave request is not found or does not belong to the specified company.
   */
  async getLeaveRequestById(companyId: string, leaveRequestId: string): Promise<LeaveRequest> {
    const leaveRequest = await this.findById(leaveRequestId);
    if (!leaveRequest || leaveRequest.companyId !== companyId) {
      throw new NotFoundError("Leave request not found");
    }
    return leaveRequest;
  }

  /**
   * @description Retrieves all leave requests for a given company.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to an array of LeaveRequest entities belonging to the company.
   */
  async getAllLeaveRequests(companyId: string): Promise<LeaveRequest[]> {
    const all = await this.findAll();
    return all.filter(lr => lr.companyId === companyId);
  }
}
