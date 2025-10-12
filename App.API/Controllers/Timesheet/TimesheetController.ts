import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Route,
  Tags,
  Path,
  Security,
  Request,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { Service } from "typedi";

import { TimesheetService } from "@/Services/Timesheet/TimesheetService";
import { Timesheet } from "@/Entities/Timesheets/Timesheet";
import { CreateTimesheetDto, CreateTimesheetEntryDto } from "@/Dtos/Timesheet/TimesheetDto";
import User from "@/Entities/Users/User";

/**
 * @summary Timesheet operations (company-scoped for mutations).
 * @tags Timesheets
 * @security jwt
 */
@Route("timesheets")
@Tags("Timesheets")
@Security("jwt")
@Service()
export class TimesheetController extends Controller {
  constructor(private readonly timesheetService: TimesheetService) {
    super();
  }

  @Post("/")
  public async createTimesheet(
    @Body() dto: CreateTimesheetDto,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    const me = request.user as User;
    return this.timesheetService.createTimesheet(me.companyId, me.id, dto);
  }

  @Get("/{id}")
  public async getTimesheet(
    @Path() id: string,
  ): Promise<Timesheet> {
    // Service is not company-scoped for this read in current impl.
    return this.timesheetService.getTimesheet(id);
  }

  @Post("/{id}/entries")
  public async addTimesheetEntry(
    @Path() id: string,
    @Body() dto: CreateTimesheetEntryDto,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    const me = request.user as User;
    return this.timesheetService.addTimesheetEntry(me.companyId, me.id, id, dto);
  }

  @Put("/{id}/submit")
  public async submitTimesheet(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    const me = request.user as User;
    return this.timesheetService.submitTimesheet(me.companyId, me.id, id);
  }

  @Put("/{id}/approve")
  @Security("jwt", ["manager", "admin"])
  public async approveTimesheet(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    const me = request.user as User;
    return this.timesheetService.approveTimesheet(me.companyId, me.id, id);
  }

  @Put("/{id}/reject")
  @Security("jwt", ["manager", "admin"])
  public async rejectTimesheet(
    @Path() id: string,
    @Body() body: { reason: string },
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    const me = request.user as User;
    return this.timesheetService.rejectTimesheet(me.companyId, me.id, id, body.reason);
  }
}
