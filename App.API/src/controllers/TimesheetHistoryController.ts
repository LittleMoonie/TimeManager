import { Body, Controller, Path, Post, Request, Route, Security, Tags } from 'tsoa';
import { TimesheetHistoryService } from '../services/TimesheetHistoryService';
import { TimesheetHistoryDto } from '../dto/timesheetHistory/TimesheetHistoryDto';
import { TimesheetHistoryEntityTypeEnum } from '../models/enums/timesheetHistory/TimesheetHistoryEntityTypeEnum';
import { Request as ExRequest } from 'express';
import User from '../models/user';
import { Service } from 'typedi';
import { TimesheetHistory } from '../models/timesheetHistory';

@Route('/api/v1/timesheet-history')
@Tags('Timesheet History')
@Security('jwt')
@Service()
export class TimesheetHistoryController extends Controller {

  private getAuthUser(request: ExRequest): { userId: string; orgId: string; role: string } {
    if (!request.user) {
      throw new Error("User not authenticated");
    }
    const user = request.user as User;
    return {
      userId: user.id,
      orgId: user.orgId,
      role: user.role,
    };
  }
  /**
   * Retrieve a paginated list of timesheet history events.
   * Employees can only view their own history. Managers/Admins can view organization-wide history.
   * @param request The express request object, containing user and organization context.
   * @param body Body parameters for filtering and pagination.
   * @returns A paginated list of timesheet history events.
   */
  @Post('/filter')
  public async listHistory(
    @Request() request: ExRequest,
    @Body() body: TimesheetHistoryDto,
  ): Promise<{ data: TimesheetHistory[]; nextCursor?: string }> {
    const { userId, orgId, role } = this.getAuthUser(request);
    return this.listHistory(request, body);
  }

  /**
   * Retrieve timesheet history events for a specific entity.
   * Employees can only view history related to their own timesheets. Managers/Admins can view organization-wide history.
   * @param request The express request object, containing user and organization context.
   * @param entityType The type of the entity (e.g., 'TimesheetEntry', 'TimesheetWeek').
   * @param entityId The UUID of the entity.
   * @returns A paginated list of timesheet history events for the specified entity.
   */
  @Post('/entity/{entityType}/{entityId}')
  public async getHistoryForEntity(
    @Request() request: ExRequest,
    @Path() entityType: TimesheetHistoryEntityTypeEnum,
    @Path() entityId: string,
  ): Promise<{ data: TimesheetHistory[]; nextCursor?: string }> {
    const { userId, orgId, role } = this.getAuthUser(request);
    return this.getHistoryForEntity(request, entityType, entityId);
  }
}
