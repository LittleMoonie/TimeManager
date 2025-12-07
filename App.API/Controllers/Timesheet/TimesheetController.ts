import { Request as ExpressRequest } from 'express';
import { Body, Controller, Get, Post, Put, Route, Tags, Path, Security, Request } from 'tsoa';
import { Service } from 'typedi';

import {
  CreateTimesheetDto,
  CreateTimesheetEntryDto,
  UpdateTimesheetDto,
  TimesheetResponseDto,
} from '../../Dtos/Timesheet/TimesheetDto';
import { Timesheet } from '../../Entities/Timesheets/Timesheet';
import User from '../../Entities/Users/User';
import { TimesheetService } from '../../Services/Timesheet/TimesheetService';

/**
 * @summary Controller for managing timesheet operations.
 * @tags Timesheets
 * @security jwt
 */
@Route('timesheets')
@Tags('Timesheets')
@Security('jwt')
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
  @Post('/')
  public async createTimesheet(
    @Body() dto: CreateTimesheetDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetResponseDto> {
    const me = request.user as User;
    const timesheet = await this.timesheetService.createTimesheet(me.companyId, me.id, dto);
    return this.mapToTimesheetResponseDto(timesheet);
  }

  /**
   * @summary Retrieves all timesheets for the authenticated user.
   * @param request The Express request object, containing user information.
   * @returns An array of timesheet details.
   */
  @Get('/')
  public async getAllTimesheetsForUser(
    @Request() request: ExpressRequest,
  ): Promise<TimesheetResponseDto[]> {
    const me = request.user as User;
    const timesheets = await this.timesheetService.getAllTimesheetsForUser(me.companyId, me.id);
    return timesheets.map(this.mapToTimesheetResponseDto);
  }

  /**
   * @summary Retrieves a single timesheet by its ID.
   * @param id The ID of the timesheet to retrieve.
   * @returns The timesheet details.
   * @throws {NotFoundError} If the timesheet is not found.
   */
  @Get('/{id}')
  public async getTimesheet(@Path() id: string): Promise<TimesheetResponseDto> {
    const timesheet = await this.timesheetService.getTimesheet(id);
    return this.mapToTimesheetResponseDto(timesheet);
  }

  /**
   * @summary Updates an existing timesheet.
   * @param id The ID of the timesheet to update.
   * @param dto The data for updating the timesheet.
   * @param request The Express request object, containing user information.
   * @returns The updated timesheet.
   * @throws {NotFoundError} If the timesheet is not found.
   * @throws {UnprocessableEntityError} If validation of the DTO fails or timesheet is not in DRAFT status.
   */
  @Put('/{id}')
  public async updateTimesheet(
    @Path() id: string,
    @Body() dto: UpdateTimesheetDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetResponseDto> {
    const me = request.user as User;
    const timesheet = await this.timesheetService.updateTimesheet(me.companyId, id, me.id, dto);
    return this.mapToTimesheetResponseDto(timesheet);
  }

  /**
   * @summary Adds a new entry to an existing timesheet.
   * @param id The ID of the timesheet to add the entry to.
   * @param dto The data for creating the timesheet entry.
   * @param request The Express request object, containing user information.
   * @returns The updated timesheet with the new entry.
   * @throws {NotFoundError} If the timesheet is not found.
   */
  @Post('/{id}/entries')
  public async addTimesheetEntry(
    @Path() id: string,
    @Body() dto: CreateTimesheetEntryDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetResponseDto> {
    const me = request.user as User;
    const timesheet = await this.timesheetService.addTimesheetEntry(me.companyId, me.id, id, dto);
    return this.mapToTimesheetResponseDto(timesheet);
  }

  /**
   * @summary Submits a timesheet for approval.
   * @param id The ID of the timesheet to submit.
   * @param request The Express request object, containing user information.
   * @returns The updated timesheet.
   * @throws {NotFoundError} If the timesheet is not found.
   * @throws {UnprocessableEntityError} If the timesheet is not in DRAFT status.
   */
  @Put('/{id}/submit')
  public async submitTimesheet(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetResponseDto> {
    const me = request.user as User;
    const timesheet = await this.timesheetService.submitTimesheet(me.companyId, me.id, id);
    return this.mapToTimesheetResponseDto(timesheet);
  }

  /**
   * @summary Approves a submitted timesheet.
   * @param id The ID of the timesheet to approve.
   * @param request The Express request object, containing user information.
   * @returns The updated timesheet.
   * @throws {NotFoundError} If the timesheet is not found.
   * @throws {UnprocessableEntityError} If the timesheet is not in SUBMITTED status.
   */
  @Put('/{id}/approve')
  @Security('jwt', ['manager', 'admin'])
  public async approveTimesheet(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetResponseDto> {
    const me = request.user as User;
    const timesheet = await this.timesheetService.approveTimesheet(me.companyId, me.id, id);
    return this.mapToTimesheetResponseDto(timesheet);
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
  @Put('/{id}/reject')
  @Security('jwt', ['manager', 'admin'])
  public async rejectTimesheet(
    @Path() id: string,
    @Body() body: { reason: string },
    @Request() request: ExpressRequest,
  ): Promise<TimesheetResponseDto> {
    const me = request.user as User;
    const timesheet = await this.timesheetService.rejectTimesheet(
      me.companyId,
      me.id,
      id,
      body.reason,
    );
    return this.mapToTimesheetResponseDto(timesheet);
  }

  /**
   * @description Maps a Timesheet entity to a TimesheetResponseDto.
   * @param timesheet The Timesheet entity to map.
   * @returns The mapped TimesheetResponseDto.
   */
  private mapToTimesheetResponseDto(timesheet: Timesheet): TimesheetResponseDto {
    return {
      id: timesheet.id,
      userId: timesheet.userId,
      periodStart: timesheet.periodStart,
      periodEnd: timesheet.periodEnd,
      status: timesheet.status,
      totalMinutes: timesheet.totalMinutes,
      notes: timesheet.notes,
      entries: timesheet.entries?.map((entry) => ({
        id: entry.id,
        actionCodeId: entry.actionCodeId,
        day: entry.day,
        durationMin: entry.durationMin,
        country: entry.country,
        workMode: entry.workMode,
        note: entry.note,
        status: entry.status,
        statusUpdatedAt: entry.statusUpdatedAt,
      })),
    };
  }
}
