import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Route,
  Tags,
  Path,
  Security,
  Request,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { Service } from "typedi";

import { TimesheetEntryService } from "@/Services/Timesheet/TimesheetEntryService";
import { CreateTimesheetEntryDto, UpdateTimesheetEntryDto } from "@/Dtos/Timesheet/TimesheetDto";
import { TimesheetEntry } from "@/Entities/Timesheets/TimesheetEntry";
import User from "@/Entities/Users/User";

/**
 * @summary Manage timesheet entries (company-scoped for creation).
 * @tags Timesheet Entries
 * @security jwt
 */
@Route("timesheet-entries")
@Tags("Timesheet Entries")
@Security("jwt")
@Service()
export class TimesheetEntryController extends Controller {
  constructor(private readonly timesheetEntryService: TimesheetEntryService) {
    super();
  }

  @Post("/")
  public async createTimesheetEntry(
    @Body() dto: CreateTimesheetEntryDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetEntry> {
    const me = request.user as User;
    return this.timesheetEntryService.createTimesheetEntry(me.companyId, me.id, dto);
  }

  @Get("/{id}")
  public async getTimesheetEntry(
    @Path() id: string,
  ): Promise<TimesheetEntry> {
    return this.timesheetEntryService.getTimesheetEntryById(id);
  }

  @Put("/{id}")
  public async updateTimesheetEntry(
    @Path() id: string,
    @Body() dto: UpdateTimesheetEntryDto,
  ): Promise<TimesheetEntry> {
    return this.timesheetEntryService.updateTimesheetEntry(id, dto);
  }

  @Delete("/{id}")
  public async deleteTimesheetEntry(
    @Path() id: string,
  ): Promise<void> {
    await this.timesheetEntryService.deleteTimesheetEntry(id);
  }
}
