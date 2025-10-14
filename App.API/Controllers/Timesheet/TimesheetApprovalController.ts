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
  CreateTimesheetApprovalDto,
  UpdateTimesheetApprovalDto,
} from '../../Dtos/Timesheet/TimesheetDto';
import { TimesheetApproval } from '../../Entities/Timesheets/TimesheetApproval';
import User from '../../Entities/Users/User';
import { TimesheetApprovalService } from '../../Services/Timesheet/TimesheetApprovalService';

/**
 * @summary Manage timesheet approvals (company-scoped).
 * @tags Timesheet Approvals
 * @security jwt
 */
@Route('timesheet-approvals')
@Tags('Timesheet Approvals')
@Security('jwt')
@Service()
export class TimesheetApprovalController extends Controller {
  constructor(private readonly timesheetApprovalService: TimesheetApprovalService) {
    super();
  }

  /**
   * @summary Creates a new timesheet approval.
   * @param dto The data for creating the timesheet approval.
   * @param request The Express request object, containing user information.
   * @returns The newly created timesheet approval.
   * @throws {UnprocessableEntityError} If validation fails or an approval for the same timesheet and approver already exists.
   */
  @Post('/')
  @Security('jwt', ['admin', 'manager'])
  public async createTimesheetApproval(
    @Body() dto: CreateTimesheetApprovalDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetApproval> {
    const me = request.user as User;
    return this.timesheetApprovalService.createTimesheetApproval(me.companyId, dto);
  }

  /**
   * @summary Retrieves a timesheet approval by its ID.
   * @param id The ID of the timesheet approval to retrieve.
   * @param request The Express request object, containing user information.
   * @returns The timesheet approval details.
   * @throws {NotFoundError} If the timesheet approval is not found.
   */
  @Get('/{id}')
  public async getTimesheetApproval(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetApproval> {
    const me = request.user as User;
    return this.timesheetApprovalService.getTimesheetApprovalById(me.companyId, id);
  }

  /**
   * @summary Updates an existing timesheet approval.
   * @param id The ID of the timesheet approval to update.
   * @param dto The data for updating the timesheet approval.
   * @param request The Express request object, containing user information.
   * @returns The updated timesheet approval details.
   * @throws {UnprocessableEntityError} If validation fails.
   * @throws {NotFoundError} If the timesheet approval to update is not found.
   */
  @Put('/{id}')
  @Security('jwt', ['admin', 'manager'])
  public async updateTimesheetApproval(
    @Path() id: string,
    @Body() dto: UpdateTimesheetApprovalDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetApproval> {
    const me = request.user as User;
    return this.timesheetApprovalService.updateTimesheetApproval(me.companyId, id, dto);
  }

  /**
   * @summary Deletes a timesheet approval by its ID.
   * @param id The ID of the timesheet approval to delete.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves upon successful deletion.
   * @throws {NotFoundError} If the timesheet approval to delete is not found.
   */
  @Delete('/{id}')
  @Security('jwt', ['admin', 'manager'])
  public async deleteTimesheetApproval(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.timesheetApprovalService.deleteTimesheetApproval(me.companyId, id);
  }
}
