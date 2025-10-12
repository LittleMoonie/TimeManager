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

import { TimesheetApprovalService } from "@/Services/Timesheet/TimesheetApprovalService";
import { CreateTimesheetApprovalDto, UpdateTimesheetApprovalDto } from "@/Dtos/Timesheet/TimesheetDto";
import { TimesheetApproval } from "@/Entities/Timesheets/TimesheetApproval";
import User from "@/Entities/Users/User";

/**
 * @summary Manage timesheet approvals (company-scoped).
 * @tags Timesheet Approvals
 * @security jwt
 */
@Route("timesheet-approvals")
@Tags("Timesheet Approvals")
@Security("jwt")
@Service()
export class TimesheetApprovalController extends Controller {
  constructor(private readonly timesheetApprovalService: TimesheetApprovalService) {
    super();
  }

  @Post("/")
  @Security("jwt", ["admin", "manager"])
  public async createTimesheetApproval(
    @Body() dto: CreateTimesheetApprovalDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetApproval> {
    const me = request.user as User;
    return this.timesheetApprovalService.createTimesheetApproval(me.companyId, dto);
  }

  @Get("/{id}")
  public async getTimesheetApproval(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetApproval> {
    const me = request.user as User;
    return this.timesheetApprovalService.getTimesheetApprovalById(me.companyId, id);
  }

  @Put("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async updateTimesheetApproval(
    @Path() id: string,
    @Body() dto: UpdateTimesheetApprovalDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetApproval> {
    const me = request.user as User;
    return this.timesheetApprovalService.updateTimesheetApproval(me.companyId, id, dto);
  }

  @Delete("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async deleteTimesheetApproval(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.timesheetApprovalService.deleteTimesheetApproval(me.companyId, id);
  }
}
