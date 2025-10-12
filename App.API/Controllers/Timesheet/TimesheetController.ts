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
 * @summary Controller for managing timesheet operations.
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

  /**
   * @summary Creates a new timesheet for the authenticated user.
   * @param dto The data for creating the timesheet.
   * @param request The Express request object, containing user information.
   * @returns The newly created timesheet.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   */
  @Post("/")
  public async createTimesheet(
    @Body() dto: CreateTimesheetDto,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    const me = request.user as User;
    return this.timesheetService.createTimesheet(me.companyId, me.id, dto);
  }

  /**
   * @summary Retrieves a single timesheet by its ID.
   * @param id The ID of the timesheet to retrieve.
   * @returns The timesheet details.
   * @throws {NotFoundError} If the timesheet is not found.
   */
  @Get("/{id}")
  public async getTimesheet(
    @Path() id: string,
  ): Promise<Timesheet> {
    // Service is not company-scoped for this read in current impl.
    return this.timesheetService.getTimesheet(id);
  }

  /**
   * @summary Adds a new entry to an existing timesheet.
   * @param id The ID of the timesheet to add the entry to.
   * @param dto The data for creating the timesheet entry.
   * @param request The Express request object, containing user information.
   * @returns The updated timesheet with the new entry.
   * @throws {NotFoundError} If the timesheet is not found.
   */
  @Post("/{id}/entries")
  public async addTimesheetEntry(
    @Path() id: string,
    @Body() dto: CreateTimesheetEntryDto,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    const me = request.user as User;
    return this.timesheetService.addTimesheetEntry(me.companyId, me.id, id, dto);
  }

  /**
   * @summary Submits a timesheet for approval.
   * @param id The ID of the timesheet to submit.
   * @param request The Express request object, containing user information.
   * @returns The updated timesheet.
   * @throws {NotFoundError} If the timesheet is not found.
   * @throws {UnprocessableEntityError} If the timesheet is not in DRAFT status.
   */
  @Put("/{id}/submit")
  public async submitTimesheet(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    const me = request.user as User;
    return this.timesheetService.submitTimesheet(me.companyId, me.id, id);
  }

  /**
   * @summary Approves a submitted timesheet.
   * @param id The ID of the timesheet to approve.
   * @param request The Express request object, containing user information.
   * @returns The updated timesheet.
   * @throws {NotFoundError} If the timesheet is not found.
   * @throws {UnprocessableEntityError} If the timesheet is not in SUBMITTED status.
   */
  @Put("/{id}/approve")
  @Security("jwt", ["manager", "admin"])
  public async approveTimesheet(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    const me = request.user as User;
    return this.timesheetService.approveTimesheet(me.companyId, me.id, id);
  }

  /**
   * @summary Rejects a submitted timesheet.
   * @param id The ID of the timesheet to reject.
   * @param body The body containing the reason for rejection.
   * @param request The Express request object, containing user information.
   * @returns The updated timesheet.
   * @throws {NotFoundError} If the timesheet is not found.
   * @throws {UnprocessableEntityError} If the timesheet is not in SUBMITTED status.
   */
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
