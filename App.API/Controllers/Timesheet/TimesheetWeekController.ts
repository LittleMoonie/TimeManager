import { Request as ExpressRequest } from 'express';
import { Body, Controller, Get, Path, Post, Put, Request, Route, Security, Tags } from 'tsoa';
import { Service } from 'typedi';

import {
  TimesheetWeekResponseDto,
  TimesheetWeekSubmitDto,
  TimesheetWeekUpsertDto,
} from '../../Dtos/Timesheet/TimesheetWeekDto';
import User from '../../Entities/Users/User';
import { TimesheetService } from '../../Services/Timesheet/TimesheetService';

@Route('timesheet/weeks')
@Tags('Timesheet Weeks')
@Security('jwt')
@Service()
export class TimesheetWeekController extends Controller {
  constructor(private readonly timesheetService: TimesheetService) {
    super();
  }

  @Get('/{weekStart}/timesheet')
  public async getWeekTimesheet(
    @Path() weekStart: string,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetWeekResponseDto> {
    const me = request.user as User;
    return this.timesheetService.getWeekTimesheet(me.companyId, me.id, weekStart);
  }

  @Put('/{weekStart}/timesheet')
  public async upsertWeekTimesheet(
    @Path() weekStart: string,
    @Body() body: TimesheetWeekUpsertDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetWeekResponseDto> {
    const me = request.user as User;
    return this.timesheetService.upsertWeekTimesheet(me.companyId, me.id, weekStart, body);
  }

  @Post('/{weekStart}/submit')
  public async submitWeekTimesheet(
    @Path() weekStart: string,
    @Request() request: ExpressRequest,
    @Body() body: TimesheetWeekSubmitDto = new TimesheetWeekSubmitDto(),
  ): Promise<TimesheetWeekResponseDto> {
    const me = request.user as User;
    return this.timesheetService.submitWeekTimesheet(me.companyId, me.id, weekStart, body);
  }
}
