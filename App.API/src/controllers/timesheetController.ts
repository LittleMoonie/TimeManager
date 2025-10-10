
import { Body, Controller, Get, Post, Put, Delete, Route, Tags, Path, Security, Request, Query } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { TimesheetEntry } from '../models/timesheetEntry';
import { TimesheetService } from '../services/timesheetService';

interface TimesheetEntryDto {
  actionCodeId: string;
  workMode: 'office' | 'remote' | 'hybrid';
  country: string;
  startedAt?: Date;
  endedAt?: Date;
  durationMin: number;
  note?: string;
  day: Date;
}

@Route('api/v1/time')
@Tags('Time')
export class TimesheetController extends Controller {
  private timesheetService = new TimesheetService();

  private getAuthUser(request: ExpressRequest): { userId: string; orgId: string } {
    // This is a placeholder for the actual auth logic.
    // We will implement this properly later.
    return {
      userId: request.user.id,
      orgId: request.user.orgId,
    };
  }

  @Security('jwt')
  @Get('/')
  public async getWeekTimesheet(@Request() request: ExpressRequest, @Query() week: string): Promise<TimesheetEntry[]> {
    const { userId, orgId } = this.getAuthUser(request);
    const weekStart = new Date(week);
    return this.timesheetService.listByWeek({ userId, orgId, weekStart });
  }

  @Security('jwt')
  @Post('/')
  public async createTimeEntry(@Body() entryDto: TimesheetEntryDto, @Request() request: ExpressRequest): Promise<TimesheetEntry> {
    const { userId, orgId } = this.getAuthUser(request);
    return this.timesheetService.create(entryDto, { userId, orgId });
  }

  @Security('jwt')
  @Put('/{id}')
  public async updateTimeEntry(@Path() id: string, @Body() entryDto: Partial<TimesheetEntryDto>, @Request() request: ExpressRequest): Promise<TimesheetEntry | null> {
    const { userId, orgId } = this.getAuthUser(request);
    return this.timesheetService.update(id, entryDto, { userId, orgId });
  }

  @Security('jwt')
  @Delete('/{id}')
  public async deleteTimeEntry(@Path() id: string, @Request() request: ExpressRequest): Promise<void> {
    const { userId, orgId } = this.getAuthUser(request);
    return this.timesheetService.delete(id, { userId, orgId });
  }
}
