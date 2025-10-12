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
import { TimesheetApprovalService } from "../../Services/Timesheet/TimesheetApprovalService";
import {
  CreateTimesheetApprovalDto,
  TimesheetApprovalResponseDto,
  UpdateTimesheetApprovalDto,
} from "../../Dtos/Timesheet/TimesheetApprovalDto";
import { Service } from "typedi";
import { UserDto } from "../../Dtos/Users/UserDto";

/**
 * @summary Controller for managing timesheet approvals.
 * @tags Timesheet Approvals
 * @security jwt
 */
@Route("timesheet-approvals")
@Tags("Timesheet Approvals")
@Security("jwt")
@Service()
export class TimesheetApprovalController extends Controller {
  constructor(private timesheetApprovalService: TimesheetApprovalService) {
    super();
  }

  /**
   * @summary Creates a new timesheet approval.
   * @param {CreateTimesheetApprovalDto} createTimesheetApprovalDto - The data for creating the timesheet approval.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<TimesheetApprovalResponseDto>} The newly created timesheet approval.
   */
  @Post("/")
  @Security("jwt", ["admin", "manager"])
  public async createTimesheetApproval(
    @Body() createTimesheetApprovalDto: CreateTimesheetApprovalDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetApprovalResponseDto> {
    const { companyId } = request.user as UserDto;
    // In a real application, you would check if the user has permission to create timesheet approvals
    const timesheetApproval =
      await this.timesheetApprovalService.createTimesheetApproval(
        companyId,
        createTimesheetApprovalDto,
      );
    return timesheetApproval;
  }

  /**
   * @summary Retrieves a single timesheet approval by its ID.
   * @param {string} id - The ID of the timesheet approval to retrieve.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<TimesheetApprovalResponseDto>} The timesheet approval details.
   */
  @Get("/{id}")
  public async getTimesheetApproval(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetApprovalResponseDto> {
    return this.timesheetApprovalService.getTimesheetApprovalById(id);
  }

  /**
   * @summary Updates an existing timesheet approval.
   * @param {string} id - The ID of the timesheet approval to update.
   * @param {UpdateTimesheetApprovalDto} updateTimesheetApprovalDto - The data for updating the timesheet approval.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<TimesheetApprovalResponseDto>} The updated timesheet approval details.
   */
  @Put("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async updateTimesheetApproval(
    @Path() id: string,
    @Body() updateTimesheetApprovalDto: UpdateTimesheetApprovalDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetApprovalResponseDto> {
    // In a real application, you would check if the user has permission to update timesheet approvals
    const updatedTimesheetApproval =
      await this.timesheetApprovalService.updateTimesheetApproval(
        id,
        updateTimesheetApprovalDto,
      );
    return updatedTimesheetApproval;
  }

  /**
   * @summary Deletes a timesheet approval by its ID.
   * @param {string} id - The ID of the timesheet approval to delete.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<void>} Nothing is returned upon successful deletion.
   */
  @Delete("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async deleteTimesheetApproval(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    // In a real application, you would check if the user has permission to delete timesheet approvals
    await this.timesheetApprovalService.deleteTimesheetApproval(id);
  }
}
