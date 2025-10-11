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
import { AuthenticationError } from "../../Errors/HttpErrors";
import { Service } from "typedi";

@Route("timesheet-approvals")
@Tags("Timesheet Approvals")
@Security("jwt")
@Service()
export class TimesheetApprovalController extends Controller {
  constructor(private timesheetApprovalService: TimesheetApprovalService) {
    super();
  }

  @Post("/")
  @Security("jwt", ["admin", "manager"])
  public async createTimesheetApproval(
    @Body() createTimesheetApprovalDto: CreateTimesheetApprovalDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetApprovalResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    // In a real application, you would check if the user has permission to create timesheet approvals
    const timesheetApproval =
      await this.timesheetApprovalService.createTimesheetApproval(
        companyId,
        createTimesheetApprovalDto,
      );
    return timesheetApproval;
  }

  @Get("/{id}")
  public async getTimesheetApproval(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetApprovalResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    return this.timesheetApprovalService.getTimesheetApprovalById(id);
  }

  @Put("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async updateTimesheetApproval(
    @Path() id: string,
    @Body() updateTimesheetApprovalDto: UpdateTimesheetApprovalDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetApprovalResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    // In a real application, you would check if the user has permission to update timesheet approvals
    const updatedTimesheetApproval =
      await this.timesheetApprovalService.updateTimesheetApproval(
        id,
        updateTimesheetApprovalDto,
      );
    return updatedTimesheetApproval;
  }

  @Delete("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async deleteTimesheetApproval(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    // In a real application, you would check if the user has permission to delete timesheet approvals
    await this.timesheetApprovalService.deleteTimesheetApproval(id);
  }
}
