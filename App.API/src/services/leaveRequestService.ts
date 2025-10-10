
import { getRepository } from 'typeorm';
import { LeaveRequest, LeaveRequestStatus, LeaveType } from '../models/leaveRequest';
import User from '../models/user';
import { AppDataSource } from '../server/database';
import { AuditLogService } from './auditLogService';

export class LeaveRequestService {
  private leaveRequestRepository = AppDataSource.getRepository(LeaveRequest);
  private userRepository = AppDataSource.getRepository(User);
  private auditLogService = new AuditLogService();

  public async getUserLeaveRequests(userId: string): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({ where: { user: { id: userId } } });
  }

  public async getLeaveRequestById(id: string): Promise<LeaveRequest | null> {
    return this.leaveRequestRepository.findOne({ where: { id } });
  }

  public async createLeaveRequest(userId: string, startDate: Date, endDate: Date, leaveType: LeaveType, reason?: string): Promise<LeaveRequest> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const leaveRequest = new LeaveRequest();
    leaveRequest.user = user;
    leaveRequest.startDate = startDate;
    leaveRequest.endDate = endDate;
    leaveRequest.leaveType = leaveType;
    leaveRequest.reason = reason;

    const newLeaveRequest = await this.leaveRequestRepository.save(leaveRequest);

    await this.auditLogService.logEvent(userId, 'CREATE', 'LeaveRequest', newLeaveRequest.id, newLeaveRequest);

    return newLeaveRequest;
  }

  public async updateLeaveRequestStatus(id: string, status: LeaveRequestStatus): Promise<LeaveRequest | null> {
    const leaveRequest = await this.leaveRequestRepository.findOne({ where: { id }, relations: ['user'] });
    if (leaveRequest) {
      const oldStatus = leaveRequest.status;
      leaveRequest.status = status;
      const updatedLeaveRequest = await this.leaveRequestRepository.save(leaveRequest);

      await this.auditLogService.logEvent(leaveRequest.user.id, 'UPDATE_STATUS', 'LeaveRequest', updatedLeaveRequest.id, { oldStatus, newStatus: status });

      return updatedLeaveRequest;
    }
    return null;
  }
}
