import { Body, Controller, Post, Request, Route, Security, Tags } from "tsoa";
import { Request as ExRequest } from "express";
import { Service } from "typedi";

import { TimesheetHistory } from "@/Entities/Timesheets/TimesheetHistory";
import { TimesheetHistoryRepository } from "@/Repositories/Timesheets/TimesheetHistoryRepository";
import User from "@/Entities/Users/User";

/**
 * @summary Controller for retrieving timesheet history events.
 * @tags Timesheet History
 * @security jwt
 */
@Route("timesheet-history")
@Tags("Timesheet History")
@Security("jwt")
@Service()
export class TimesheetHistoryController extends Controller {
  constructor(private readonly historyRepo: TimesheetHistoryRepository) {
    super();
  }

  /**
   * @summary Filters and retrieves timesheet history events by a specific target (e.g., Timesheet, TimesheetEntry).
   * @param request The Express request object, containing user information.
   * @param body The request body containing the target type and ID to filter history by.
   * @param body.targetType The type of the target entity (e.g., "Timesheet", "TimesheetEntry", "TimesheetApproval", "ActionCode").
   * @param body.targetId The unique identifier of the target entity.
   * @returns An array of TimesheetHistory entities matching the filter criteria.
   */
  @Post("/filter")
  public async listHistory(
    @Request() request: ExRequest,
    @Body() body: { targetType: "ActionCode" | "Timesheet" | "TimesheetEntry" | "TimesheetApproval"; targetId: string; },
  ): Promise<TimesheetHistory[]> {
    const me = request.user as User;
    // Assuming repository exposes a finder like this; if not, replace with a QueryBuilder in the repo.
    return this.historyRepo.findAllForTarget(me.companyId, body.targetType, body.targetId);
  }
}
