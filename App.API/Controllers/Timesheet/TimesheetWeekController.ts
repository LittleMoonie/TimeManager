import { Request as ExpressRequest } from 'express';
import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from 'tsoa';
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
    @Query() userId?: string,
  ): Promise<TimesheetWeekResponseDto> {
    const me = request.user as User;
    let targetUserId = me.id;

    if (userId && userId !== me.id) {
      if (
        !me.role.rolePermissions.some((rp) => rp.permission.name === 'timesheet.create.forUser')
      ) {
        throw new Error("You do not have permission to view other users' timesheets.");
      }
      targetUserId = userId;
    }

    return this.timesheetService.getWeekTimesheet(me.companyId, targetUserId, weekStart);
  }

  @Put('/{weekStart}/timesheet')
  public async upsertWeekTimesheet(
    @Path() weekStart: string,
    @Body() body: TimesheetWeekUpsertDto,
    @Request() request: ExpressRequest,
    @Query() userId?: string,
  ): Promise<TimesheetWeekResponseDto> {
    const me = request.user as User;
    let targetUserId = me.id;

    if (userId && userId !== me.id) {
      if (
        !me.role.rolePermissions.some((rp) => rp.permission.name === 'timesheet.create.forUser')
      ) {
        throw new Error("You do not have permission to create or update other users' timesheets.");
      }
      targetUserId = userId;
    }

    return this.timesheetService.upsertWeekTimesheet(me.companyId, targetUserId, weekStart, body);
  }

  @Post('/{weekStart}/submit')
  public async submitWeekTimesheet(
    @Path() weekStart: string,
    @Request() request: ExpressRequest,
    @Body() body: TimesheetWeekSubmitDto = new TimesheetWeekSubmitDto(),
    @Query() userId?: string,
  ): Promise<TimesheetWeekResponseDto> {
    const me = request.user as User;
    let targetUserId = me.id;

    if (userId && userId !== me.id) {
      if (
        !me.role.rolePermissions.some((rp) => rp.permission.name === 'timesheet.create.forUser')
      ) {
        throw new Error("You do not have permission to submit other users' timesheets.");
      }
      targetUserId = userId;
    }

    return this.timesheetService.submitWeekTimesheet(me.companyId, targetUserId, weekStart, body);
  }
}
