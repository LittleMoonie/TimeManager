import {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
} from "../../Entities/Companies/LeaveRequest";
import { DataLogAction } from "../../Entities/Logs/Data/DataLog";
import User from "../../Entities/Users/User";
import { AppDataSource } from "../../Server/Database";
import { AuditLogService } from "../Logs/AuditLogService";

export class LeaveRequestService {
  private leaveRequestRepository = AppDataSource.getRepository(LeaveRequest);
  private userRepository = AppDataSource.getRepository(User);
  private auditLogService = new AuditLogService();

  public async getUserLeaveRequests(userId: string): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: { user: { id: userId } },
    });
  }

  public async getLeaveRequestById(
    id: string,
    companyId: string,
  ): Promise<LeaveRequest | null> {
    return this.leaveRequestRepository.findOne({
      where: { id, user: { company: { id: companyId } } },
    });
  }

  public async createLeaveRequest(
    userId: string,
    startDate: Date,
    endDate: Date,
    leaveType: LeaveType,
    reason?: string,
  ): Promise<LeaveRequest> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const leaveRequest = new LeaveRequest();
    leaveRequest.user = user;
    leaveRequest.startDate = startDate;
    leaveRequest.endDate = endDate;
    leaveRequest.leaveType = leaveType;
    leaveRequest.reason = reason;

    const newLeaveRequest =
      await this.leaveRequestRepository.save(leaveRequest);

    await this.auditLogService.logEvent(
      userId,
      user.companyId,
      DataLogAction.CREATE,
      "LeaveRequest",
      newLeaveRequest.id,
      newLeaveRequest as unknown as Record<string, string>,
    );

    return newLeaveRequest;
  }

  public async updateLeaveRequestStatus(
    id: string,
    companyId: string,
    status: LeaveRequestStatus,
  ): Promise<LeaveRequest | null> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id, user: { company: { id: companyId } } },
      relations: ["user"],
    });
    if (leaveRequest) {
      const oldStatus = leaveRequest.status;
      leaveRequest.status = status;
      const updatedLeaveRequest =
        await this.leaveRequestRepository.save(leaveRequest);

      await this.auditLogService.logEvent(
        leaveRequest.user.id,
        leaveRequest.user.companyId,
        DataLogAction.UPDATE,
        "LeaveRequest",
        updatedLeaveRequest.id,
        { oldStatus, newStatus: status },
      );

      return updatedLeaveRequest;
    }
    return null;
  }
}
