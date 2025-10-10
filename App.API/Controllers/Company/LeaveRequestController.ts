
import { Body, Controller, Get, Post, Put, Route, Tags, Path, Security, Request } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { LeaveRequest, LeaveRequestStatus, LeaveType } from '../../Entity/Company/LeaveRequest';
import { LeaveRequestService } from '../../Service/Company/LeaveRequestService';
import User from '../../Entity/Users/User';

@Route('leave-requests')
@Tags('Leave Requests')
export class LeaveRequestController extends Controller {
  private leaveRequestService = new LeaveRequestService();

  private getAuthUser(request: ExpressRequest): { userId: string; orgId: string } {
    if (!request.user) {
      throw new Error("User not authenticated");
    }
    const user = request.user as User;
    return {
      userId: user.id,
      orgId: user.orgId,
    };
  }

  @Security('jwt')
  @Get('/')
  public async getLeaveRequests(@Request() request: ExpressRequest): Promise<LeaveRequest[]> {
    const { userId } = this.getAuthUser(request);
    return this.leaveRequestService.getUserLeaveRequests(userId);
  }

  @Security('jwt')
  @Get('/{id}')
  public async getLeaveRequest(@Path() id: string, @Request() request: ExpressRequest): Promise<LeaveRequest | null> {
    const { orgId } = this.getAuthUser(request);
    return this.leaveRequestService.getLeaveRequestById(id, orgId);
  }

  @Security('jwt')
  @Post('/')
  public async createLeaveRequest(@Body() body: { startDate: Date; endDate: Date; leaveType: LeaveType; reason?: string }, @Request() request: ExpressRequest): Promise<LeaveRequest> {
    const { userId } = this.getAuthUser(request);
    return this.leaveRequestService.createLeaveRequest(userId, body.startDate, body.endDate, body.leaveType, body.reason);
  }

  @Security('jwt')
  @Put('/{id}/status')
  public async updateLeaveRequestStatus(@Path() id: string, @Body() body: { status: LeaveRequestStatus }, @Request() request: ExpressRequest): Promise<LeaveRequest | null> {
    const { orgId } = this.getAuthUser(request);
    // In a real app, only managers/admins should be able to approve/reject
    return this.leaveRequestService.updateLeaveRequestStatus(id, orgId, body.status);
  }
}
