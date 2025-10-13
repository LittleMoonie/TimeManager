import { Controller, Get, Route, Tags, Security, Request, Path, Delete } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { Service } from 'typedi';

import { ActiveSessionService } from '../../Services/Users/ActiveSessionService';
import { ActiveSessionResponseDto } from '../../Dtos/Users/UserDto';
import User from '../../Entities/Users/User';

/**
 * @summary Controller for managing active refresh-token sessions.
 * @tags Active Sessions
 * @security jwt
 */
@Route('active-sessions')
@Tags('Active Sessions')
@Security('jwt')
@Service()
export class ActiveSessionsController extends Controller {
  constructor(private readonly activeSessionService: ActiveSessionService) {
    super();
  }

  /**
   * @summary Retrieves all active sessions for the authenticated user within their company.
   * @param request The Express request object, containing user information.
   * @returns An array of active session details.
   */
  @Get('/')
  public async getAllUserSessions(
    @Request() request: ExpressRequest,
  ): Promise<ActiveSessionResponseDto[]> {
    const me = request.user as User;
    return this.activeSessionService.getAllUserSessions(me.companyId, me.id);
  }

  /**
   * @summary Revokes a specific active session by its token hash within the authenticated user's company.
   * @param tokenHash The hash of the refresh token to revoke.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves upon successful revocation.
   * @throws {NotFoundError} If the session is not found.
   */
  @Delete('/{tokenHash}')
  public async revokeActiveSession(
    @Path() tokenHash: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.activeSessionService.revokeActiveSession(me.companyId, tokenHash);
  }
}
