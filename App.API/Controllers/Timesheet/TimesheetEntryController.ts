import { Request as ExpressRequest } from 'express';
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
} from 'tsoa';
import { Service } from 'typedi';

import {
  CreateTimesheetEntryDto,
  UpdateTimesheetEntryDto,
} from '../../Dtos/Timesheet/TimesheetDto';
import { TimesheetEntry } from '../../Entities/Timesheets/TimesheetEntry';
import User from '../../Entities/Users/User';
import { TimesheetEntryService } from '../../Services/Timesheet/TimesheetEntryService';

/**
 * @summary Controller for managing timesheet entries.
 * @tags Timesheet Entries
 * @security jwt
 */
@Route('timesheet-entries')
@Tags('Timesheet Entries')
@Security('jwt')
@Service()
export class TimesheetEntryController extends Controller {
  constructor(private readonly timesheetEntryService: TimesheetEntryService) {
    super();
  }

  /**
   * @summary Creates a new timesheet entry for the authenticated user.
   * @param dto The data for creating the timesheet entry.
   * @param request The Express request object, containing user information.
   * @returns The newly created timesheet entry.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   */
  @Post('/')
  public async createTimesheetEntry(
    @Body() dto: CreateTimesheetEntryDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetEntry> {
    const me = request.user as User;
    return this.timesheetEntryService.createTimesheetEntry(me.companyId, me.id, dto);
  }

  /**
   * @summary Retrieves a single timesheet entry by its ID.
   * @param id The ID of the timesheet entry to retrieve.
   * @returns The timesheet entry details.
   * @throws {NotFoundError} If the timesheet entry is not found.
   */
  @Get('/{id}')
  public async getTimesheetEntry(@Path() id: string): Promise<TimesheetEntry> {
    return this.timesheetEntryService.getTimesheetEntryById(id);
  }

  /**
   * @summary Updates an existing timesheet entry.
   * @param id The ID of the timesheet entry to update.
   * @param dto The data for updating the timesheet entry.
   * @returns The updated timesheet entry details.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   * @throws {NotFoundError} If the timesheet entry to update is not found.
   */
  @Put('/{id}')
  public async updateTimesheetEntry(
    @Path() id: string,
    @Body() dto: UpdateTimesheetEntryDto,
  ): Promise<TimesheetEntry> {
    return this.timesheetEntryService.updateTimesheetEntry(id, dto);
  }

  /**
   * @summary Deletes a timesheet entry by its ID.
   * @param id The ID of the timesheet entry to delete.
   * @returns A Promise that resolves upon successful deletion.
   * @throws {NotFoundError} If the timesheet entry to delete is not found.
   */
  @Delete('/{id}')
  public async deleteTimesheetEntry(@Path() id: string): Promise<void> {
    await this.timesheetEntryService.deleteTimesheetEntry(id);
  }
}
