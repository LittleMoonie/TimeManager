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
import { Timesheet } from "../../Entities/Timesheets/Timesheet";
import {
  CreateTimesheetDto,
  CreateTimesheetEntryDto,
} from "../../Dtos/Timesheet/TimesheetDto";
import { TimesheetService } from "../../Services/Timesheet/TimesheetService";
import { AuthenticationError } from "../../Errors/HttpErrors";
import { Service } from "typedi";

@Route("timesheets")
@Tags("Timesheets")
@Security("jwt")
@Service()
export class TimesheetController extends Controller {
  constructor(private timesheetService: TimesheetService) {
    super();
  }

  @Post("/")
  public async createTimesheet(
    @Body() createTimesheetDto: CreateTimesheetDto,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
    return this.timesheetService.createTimesheet(
      companyId,
      userId,
      createTimesheetDto,
    );
  }

  @Get("/{id}")
  public async getTimesheet(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    return this.timesheetService.getTimesheet(companyId, id);
  }

  @Post("/{id}/entries")
  public async addTimesheetEntry(
    @Path() id: string,
    @Body() createTimesheetEntryDto: CreateTimesheetEntryDto,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
    return this.timesheetService.addTimesheetEntry(
      companyId,
      userId,
      id,
      createTimesheetEntryDto,
    );
  }

  @Put("/{id}/submit")
  public async submitTimesheet(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
    return this.timesheetService.submitTimesheet(companyId, userId, id);
  }

  @Put("/{id}/approve")
  @Security("jwt", ["manager", "admin"])
  public async approveTimesheet(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: approverId, companyId } = request.user;
    return this.timesheetService.approveTimesheet(companyId, approverId, id);
  }

  @Put("/{id}/reject")
  @Security("jwt", ["manager", "admin"])
  public async rejectTimesheet(
    @Path() id: string,
    @Body() body: { reason: string },
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: approverId, companyId } = request.user;
    return this.timesheetService.rejectTimesheet(
      companyId,
      approverId,
      id,
      body.reason,
    );
  }
}
