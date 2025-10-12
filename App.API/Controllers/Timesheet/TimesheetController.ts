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
import { UserDto } from "../../Dtos/Users/UserDto";

/**
 * @summary Controller for managing timesheets and timesheet entries.
 * @tags Timesheets
 * @security jwt
 */
@Route("timesheets")
@Tags("Timesheets")
@Security("jwt")
@Service()
export class TimesheetController extends Controller {
  constructor(private timesheetService: TimesheetService) {
    super();
  }

  /**
   * @summary Creates a new timesheet for the authenticated user.
   * @param {CreateTimesheetDto} createTimesheetDto - The data for creating the timesheet.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<Timesheet>} The newly created timesheet.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Post("/")
  public async createTimesheet(
    @Body() createTimesheetDto: CreateTimesheetDto,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    return this.timesheetService.createTimesheet(
      companyId,
      userId,
      createTimesheetDto,
    );
  }

  /**
   * @summary Retrieves a single timesheet by its ID.
   * @param {string} id - The ID of the timesheet to retrieve.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<Timesheet>} The timesheet details.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Get("/{id}")
  public async getTimesheet(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user as UserDto;
    return this.timesheetService.getTimesheet(companyId, id);
  }

  /**
   * @summary Adds a new entry to an existing timesheet.
   * @param {string} id - The ID of the timesheet to add the entry to.
   * @param {CreateTimesheetEntryDto} createTimesheetEntryDto - The data for creating the timesheet entry.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<Timesheet>} The updated timesheet with the new entry.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Post("/{id}/entries")
  public async addTimesheetEntry(
    @Path() id: string,
    @Body() createTimesheetEntryDto: CreateTimesheetEntryDto,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    return this.timesheetService.addTimesheetEntry(
      companyId,
      userId,
      id,
      createTimesheetEntryDto,
    );
  }

  /**
   * @summary Submits a timesheet for approval.
   * @param {string} id - The ID of the timesheet to submit.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<Timesheet>} The submitted timesheet.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Put("/{id}/submit")
  public async submitTimesheet(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    return this.timesheetService.submitTimesheet(companyId, userId, id);
  }

  /**
   * @summary Approves a timesheet.
   * @param {string} id - The ID of the timesheet to approve.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<Timesheet>} The approved timesheet.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Put("/{id}/approve")
  @Security("jwt", ["manager", "admin"])
  public async approveTimesheet(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Timesheet> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: approverId, companyId } = request.user as UserDto;
    return this.timesheetService.approveTimesheet(companyId, approverId, id);
  }

  /**
   * @summary Rejects a timesheet with a given reason.
   * @param {string} id - The ID of the timesheet to reject.
   * @param {object} body - The request body containing the rejection reason.
   * @param {string} body.reason - The reason for rejecting the timesheet.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<Timesheet>} The rejected timesheet.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
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
    const { id: approverId, companyId } = request.user as UserDto;
    return this.timesheetService.rejectTimesheet(
      companyId,
      approverId,
      id,
      body.reason,
    );
  }
}
