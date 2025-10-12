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
import { TimesheetEntryService } from "../../Services/Timesheet/TimesheetEntryService";
import {
  CreateTimesheetEntryDto,
  TimesheetEntryResponseDto,
  UpdateTimesheetEntryDto,
} from "../../Dtos/Timesheet/TimesheetDto";
import { Service } from "typedi";
import { UserDto } from "../../Dtos/Users/UserDto";

/**
 * @summary Controller for managing timesheet entries.
 * @tags Timesheet Entries
 * @security jwt
 */
@Route("timesheet-entries")
@Tags("Timesheet Entries")
@Security("jwt")
@Service()
export class TimesheetEntryController extends Controller {
  constructor(private timesheetEntryService: TimesheetEntryService) {
    super();
  }

  /**
   * @summary Creates a new timesheet entry.
   * @param {CreateTimesheetEntryDto} createTimesheetEntryDto - The data for creating the timesheet entry.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<TimesheetEntryResponseDto>} The newly created timesheet entry.
   */
  @Post("/")
  public async createTimesheetEntry(
    @Body() createTimesheetEntryDto: CreateTimesheetEntryDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetEntryResponseDto> {
    const { id: userId, companyId } = request.user as UserDto;
    // In a real application, you would check if the user has permission to create timesheet entries
    const timesheetEntry =
      await this.timesheetEntryService.createTimesheetEntry(
        companyId,
        userId,
        createTimesheetEntryDto,
      );
    return timesheetEntry;
  }

  /**
   * @summary Retrieves a single timesheet entry by its ID.
   * @param {string} id - The ID of the timesheet entry to retrieve.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<TimesheetEntryResponseDto>} The timesheet entry details.
   */
  @Get("/{id}")
  public async getTimesheetEntry(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetEntryResponseDto> {
    return this.timesheetEntryService.getTimesheetEntryById(id);
  }

  /**
   * @summary Updates an existing timesheet entry.
   * @param {string} id - The ID of the timesheet entry to update.
   * @param {UpdateTimesheetEntryDto} updateTimesheetEntryDto - The data for updating the timesheet entry.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<TimesheetEntryResponseDto>} The updated timesheet entry details.
   */
  @Put("/{id}")
  public async updateTimesheetEntry(
    @Path() id: string,
    @Body() updateTimesheetEntryDto: UpdateTimesheetEntryDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetEntryResponseDto> {
    // In a real application, you would check if the user has permission to update timesheet entries
    const updatedTimesheetEntry =
      await this.timesheetEntryService.updateTimesheetEntry(
        id,
        updateTimesheetEntryDto,
      );
    return updatedTimesheetEntry;
  }

  /**
   * @summary Deletes a timesheet entry by its ID.
   * @param {string} id - The ID of the timesheet entry to delete.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<void>} Nothing is returned upon successful deletion.
   */
  @Delete("/{id}")
  public async deleteTimesheetEntry(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    // In a real application, you would check if the user has permission to delete timesheet entries
    await this.timesheetEntryService.deleteTimesheetEntry(id);
  }
}
