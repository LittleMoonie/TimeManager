import { Body, Controller, Post, Request, Route, Security, Tags } from "tsoa";
import { Request as ExRequest } from "express";
import { Service } from "typedi";
import { TimesheetHistory } from "../../Entities/Timesheets/TimesheetHistory";
import { AuthenticationError } from "../../Errors/HttpErrors";
import { TimesheetHistoryService } from "../../Services/Logs/Timesheet/TimesheetHistoryService";
import { TimesheetHistoryResponseDto } from "../../Dtos/Logs/Timesheet/TimesheetHistoryDto";

@Route("timesheet-history")
@Tags("Timesheet History")
@Security("jwt")
@Service()
export class TimesheetHistoryController extends Controller {
  constructor(private timesheetHistoryService: TimesheetHistoryService) {
    super();
  }

  @Post("/filter")
  public async listHistory(
    @Request() request: ExRequest,
    @Body() body: TimesheetHistoryResponseDto,
  ): Promise<TimesheetHistory[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    // This is a simple implementation. A more complex implementation would handle pagination and filtering.
    return this.timesheetHistoryService.getHistoryForTarget(
      companyId,
      body.targetType!,
      body.targetId!,
    );
  }
}
