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
import { AuthenticationError } from "../../Errors/HttpErrors";
import { Service } from "typedi";

@Route("timesheet-entries")
@Tags("Timesheet Entries")
@Security("jwt")
@Service()
export class TimesheetEntryController extends Controller {
  constructor(private timesheetEntryService: TimesheetEntryService) {
    super();
  }

  @Post("/")
  public async createTimesheetEntry(
    @Body() createTimesheetEntryDto: CreateTimesheetEntryDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetEntryResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
    // In a real application, you would check if the user has permission to create timesheet entries
    const timesheetEntry =
      await this.timesheetEntryService.createTimesheetEntry(
        companyId,
        userId,
        createTimesheetEntryDto,
      );
    return timesheetEntry;
  }

  @Get("/{id}")
  public async getTimesheetEntry(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetEntryResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    return this.timesheetEntryService.getTimesheetEntryById(id);
  }

  @Put("/{id}")
  public async updateTimesheetEntry(
    @Path() id: string,
    @Body() updateTimesheetEntryDto: UpdateTimesheetEntryDto,
    @Request() request: ExpressRequest,
  ): Promise<TimesheetEntryResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    // In a real application, you would check if the user has permission to update timesheet entries
    const updatedTimesheetEntry =
      await this.timesheetEntryService.updateTimesheetEntry(
        id,
        updateTimesheetEntryDto,
      );
    return updatedTimesheetEntry;
  }

  @Delete("/{id}")
  public async deleteTimesheetEntry(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    // In a real application, you would check if the user has permission to delete timesheet entries
    await this.timesheetEntryService.deleteTimesheetEntry(id);
  }
}
