import {
  Controller,
  Get,
  Route,
  Tags,
  Security,
  Request,
  Path,
  Delete,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { Service } from "typedi";

import { ActiveSessionService } from "@Services/Users/ActiveSessionService";
import { ActiveSessionResponseDto } from "@/Dtos/Users/UserDto";
import User from "@/Entities/Users/User";

/**
 * @summary Manage your active refresh-token sessions.
 * @tags Active Sessions
 * @security jwt
 */
@Route("active-sessions")
@Tags("Active Sessions")
@Security("jwt")
@Service()
export class ActiveSessionsController extends Controller {
  constructor(private readonly activeSessionService: ActiveSessionService) {
    super();
  }

  /**
   * @summary List all of my active sessions (company-scoped).
   */
  @Get("/")
  public async getAllUserSessions(
    @Request() request: ExpressRequest,
  ): Promise<ActiveSessionResponseDto[]> {
    const me = request.user as User;
    return this.activeSessionService.getAllUserSessions(me.companyId, me.id);
  }

  /**
   * @summary Revoke a specific session (by token hash) within my company.
   */
  @Delete("/{tokenHash}")
  public async revokeActiveSession(
    @Path() tokenHash: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.activeSessionService.revokeActiveSession(me.companyId, tokenHash);
  }
}
