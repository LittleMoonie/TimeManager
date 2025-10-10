
import { Body, Controller, Get, Post, Put, Route, Tags, Path, Security, Request } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { Timesheet, TimesheetStatus } from '../models/timesheet';
import { TimesheetService } from '../services/timesheetService';

@Route('timesheets')
@Tags('Timesheets')
export class TimesheetController extends Controller {
  private timesheetService = new TimesheetService();

  @Security('jwt')
  @Get('/')
  public async getTimesheets(@Request() request: ExpressRequest): Promise<Timesheet[]> {
    return this.timesheetService.getUserTimesheets(request.user.id);
  }

  @Security('jwt')
  @Get('/{id}')
  public async getTimesheet(@Path() id: string): Promise<Timesheet | null> {
    return this.timesheetService.getTimesheetById(id);
  }

  @Security('jwt')
  @Post('/')
  public async createTimesheet(@Body() body: { startDate: Date; endDate: Date }, @Request() request: ExpressRequest): Promise<Timesheet> {
    return this.timesheetService.createTimesheet(request.user.id, body.startDate, body.endDate);
  }

  @Security('jwt')
  @Put('/{id}/status')
  public async updateTimesheetStatus(@Path() id: string, @Body() body: { status: TimesheetStatus }): Promise<Timesheet | null> {
    return this.timesheetService.updateTimesheetStatus(id, body.status);
  }
}
