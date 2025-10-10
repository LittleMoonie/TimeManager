
import { Body, Controller, Get, Post, Put, Route, Tags, Path, Security, Request } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { LeaveRequest, LeaveRequestStatus, LeaveType } from '../models/leaveRequest';
import { LeaveRequestService } from '../services/leaveRequestService';

@Route('leave-requests')
@Tags('Leave Requests')
export class LeaveRequestController extends Controller {
  private leaveRequestService = new LeaveRequestService();

  @Security('jwt')
  @Get('/')
  public async getLeaveRequests(@Request() request: ExpressRequest): Promise<LeaveRequest[]> {
    return this.leaveRequestService.getUserLeaveRequests(request.user.id);
  }

  @Security('jwt')
  @Get('/{id}')
  public async getLeaveRequest(@Path() id: string): Promise<LeaveRequest | null> {
    return this.leaveRequestService.getLeaveRequestById(id);
  }

  @Security('jwt')
  @Post('/')
  public async createLeaveRequest(@Body() body: { startDate: Date; endDate: Date; leaveType: LeaveType; reason?: string }, @Request() request: ExpressRequest): Promise<LeaveRequest> {
    return this.leaveRequestService.createLeaveRequest(request.user.id, body.startDate, body.endDate, body.leaveType, body.reason);
  }

  @Security('jwt')
  @Put('/{id}/status')
  public async updateLeaveRequestStatus(@Path() id: string, @Body() body: { status: LeaveRequestStatus }): Promise<LeaveRequest | null> {
    // In a real app, only managers/admins should be able to approve/reject
    return this.leaveRequestService.updateLeaveRequestStatus(id, body.status);
  }
}
