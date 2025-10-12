import { Body, Controller, Post, Request, Route, Security, Tags } from "tsoa";
import { Request as ExRequest } from "express";
import { Service } from "typedi";
import { TimesheetHistory } from "../../Entities/Timesheets/TimesheetHistory";
import { TimesheetHistoryService } from "../../Services/Logs/Timesheet/TimesheetHistoryService";
import { TimesheetHistoryResponseDto } from "../../Dtos/Logs/Timesheet/TimesheetHistoryDto";
import { UserDto } from "../../Dtos/Users/UserDto";

/**
 * @summary Controller for retrieving timesheet history logs.
 * @tags Timesheet History
 * @security jwt
 */
@Route("timesheet-history")
@Tags("Timesheet History")
@Security("jwt")
@Service()
export class TimesheetHistoryController extends Controller {
  constructor(private timesheetHistoryService: TimesheetHistoryService) {
    super();
  }

  /**
   * @summary Retrieves the history of a specific timesheet or timesheet entry.
   * @param {ExRequest} request - The Express request object, containing user information.
   * @param {TimesheetHistoryResponseDto} body - The request body containing targetType and targetId for filtering.
   * @returns {Promise<TimesheetHistory[]>} An array of timesheet history records.
   */
  @Post("/filter")
  public async listHistory(
    @Request() request: ExRequest,
    @Body() body: TimesheetHistoryResponseDto,
  ): Promise<TimesheetHistory[]> {
    const { companyId } = request.user as UserDto;
    // This is a simple implementation. A more complex implementation would handle pagination and filtering.
    return this.timesheetHistoryService.getHistoryForTarget(
      companyId,
      body.targetType!,
      body.targetId!,
    );
  }
}
