import { Service } from "typedi";
import { LeaveRequest } from "@/Entities/Companies/LeaveRequest";
import { BaseRepository } from "@/Repositories/BaseRepository";
import { NotFoundError } from "@/Errors/HttpErrors";

@Service()
export class LeaveRequestRepository extends BaseRepository<LeaveRequest> {
  constructor() {
    super(LeaveRequest);
  }

  async getLeaveRequestById(companyId: string, leaveRequestId: string): Promise<LeaveRequest> {
    const leaveRequest = await this.findById(leaveRequestId);
    if (!leaveRequest || leaveRequest.companyId !== companyId) {
      throw new NotFoundError("Leave request not found");
    }
    return leaveRequest;
  }

  async getAllLeaveRequests(companyId: string): Promise<LeaveRequest[]> {
    const all = await this.findAll();
    return all.filter(lr => lr.companyId === companyId);
  }
}
