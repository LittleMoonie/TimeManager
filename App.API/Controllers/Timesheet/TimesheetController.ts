
import { Body, Controller, Get, Post, Put, Delete, Route, Tags, Path, Security, Request, Query } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { TimesheetEntry } from '../../Entity/Timesheet/TimesheetEntry';
import User from '../../Entity/Users/User';
import { Approval } from '../../Entity/Company/Approval';

import { TimesheetEntryDto, TimesheetHistorySummary } from '../../Dto/Timesheet/TimesheetDto';

@Route('api/v1/time')
@Tags('Time')
export class TimesheetController extends Controller {
  private getAuthUser(request: ExpressRequest): { userId: string; orgId: string; role: string } {
    if (!request.user) {
      throw new Error("User not authenticated");
    }
    const user = request.user as User;
    return {
      userId: user.id,
      orgId: user.orgId,
      role: user.role,
    };
  }

  @Security('jwt')
  @Get('/')
  public async getWeekTimesheet(@Request() request: ExpressRequest, @Query() week: string, @Query() page: number = 1, @Query() limit: number = 10): Promise<{ data: TimesheetEntry[]; total: number; page: number; lastPage: number }> {
    const { userId, orgId } = this.getAuthUser(request);
    const weekStart = new Date(week);
    return this.getWeekTimesheet(request, week, page, limit);
  }

  @Security('jwt')
  @Post('/')
  public async createTimeEntry(@Body() entryDto: TimesheetEntryDto, @Request() request: ExpressRequest): Promise<TimesheetEntry> {
    const { userId, orgId } = this.getAuthUser(request);
    return this.createTimeEntry(entryDto, request);
  }

  @Security('jwt')
  @Put('/{id}')
  public async updateTimeEntry(@Path() id: string, @Body() entryDto: Partial<TimesheetEntryDto>, @Request() request: ExpressRequest): Promise<TimesheetEntry | null> {
    const { userId, orgId } = this.getAuthUser(request);
    return this.updateTimeEntry(id, entryDto, request);
  }

  @Security('jwt')
  @Delete('/{id}')
  public async deleteTimeEntry(@Path() id: string, @Request() request: ExpressRequest): Promise<void> {
    const { userId, orgId } = this.getAuthUser(request);
    return this.deleteTimeEntry(id, request);
  }

  @Security('jwt', ['manager', 'admin'])
  @Post('/{id}/approve')
  public async approveTimeEntry(@Path() id: string, @Request() request: ExpressRequest): Promise<Approval | null> {
    const { userId, orgId, role } = this.getAuthUser(request);
    if (role !== 'manager' && role !== 'admin') {
      throw new Error("Forbidden: Only managers and admins can approve timesheet entries");
    }
    return this.approveTimeEntry(id, request);
  }

  @Security('jwt', ['manager', 'admin'])
  @Post('/{id}/reject')
  public async rejectTimeEntry(@Path() id: string, @Body() body: { reason?: string }, @Request() request: ExpressRequest): Promise<Approval | null> {
    const { userId, orgId, role } = this.getAuthUser(request);
    if (role !== 'manager' && role !== 'admin') {
      throw new Error("Forbidden: Only managers and admins can reject timesheet entries");
    }
    return this.rejectTimeEntry(id, body, request);
  }

  @Security('jwt')
  @Get('/history')
  public async getTimesheetHistory(@Request() request: ExpressRequest): Promise<TimesheetHistorySummary[]> {
    const { userId, orgId } = this.getAuthUser(request);
    return this.getTimesheetHistory(request);
  }
}
