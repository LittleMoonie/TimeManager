import { Body, Controller, Get, Path, Query, Request, Route, Security, Tags } from 'tsoa';
import { TimesheetHistoryService } from '../services/TimesheetHistoryService';
import { TimesheetHistoryDto } from '../dto/timesheetHistory/TimesheetHistoryDto';
import { TimesheetHistoryEntityType } from '../models/timesheetHistory';
import { Request as ExRequest } from 'express';
import { Service } from 'typedi';

@Route('/api/v1/timesheet-history')
@Tags('Timesheet History')
@Security('jwt')
@Service()
export class TimesheetHistoryController extends Controller {
  constructor(private timesheetHistoryService: TimesheetHistoryService) {
    super();
  }

  /**
   * Retrieve a paginated list of timesheet history events.
   * Employees can only view their own history. Managers/Admins can view organization-wide history.
   * @param request The express request object, containing user and organization context.
   * @param query Query parameters for filtering and pagination.
   * @returns A paginated list of timesheet history events.
   */
  @Get('/')
  public async listHistory(
    @Request() request: ExRequest,
    @Query() query: TimesheetHistoryDto,
  ) {
    const { user, organization } = request;
    return this.timesheetHistoryService.list(query, { orgId: organization!.id, userId: user!.id, roles: user!.roles });
  }

  /**
   * Retrieve timesheet history events for a specific entity.
   * Employees can only view history related to their own timesheets. Managers/Admins can view organization-wide history.
   * @param request The express request object, containing user and organization context.
   * @param entityType The type of the entity (e.g., 'TimesheetEntry', 'TimesheetWeek').
   * @param entityId The UUID of the entity.
   * @returns A paginated list of timesheet history events for the specified entity.
   */
  @Get('/entity/{entityType}/{entityId}')
  public async getHistoryForEntity(
    @Request() request: ExRequest,
    @Path() entityType: TimesheetHistoryEntityType,
    @Path() entityId: string,
  ) {
    const { user, organization } = request;
    return this.timesheetHistoryService.forEntity(entityType, entityId, { orgId: organization!.id, userId: user!.id, roles: user!.roles });
  }
}
