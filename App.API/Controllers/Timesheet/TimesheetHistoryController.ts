import { Body, Controller, Post, Request, Route, Security, Tags } from "tsoa";
import { Request as ExRequest } from "express";
import { Service } from "typedi";

import { TimesheetHistory } from "@/Entities/Timesheets/TimesheetHistory";
import { TimesheetHistoryRepository } from "@/Repositories/Timesheets/TimesheetHistoryRepository";
import User from "@/Entities/Users/User";

/**
 * @summary Retrieve history events (company-scoped).
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
   * @summary Filter history by target
   * @example body { "targetType": "Timesheet", "targetId": "uuid" }
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
