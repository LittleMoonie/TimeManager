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
import { ActiveSessionService } from "../../Services/User/ActiveSessionService";
import { ActiveSessionResponseDto } from "../../Dtos/Users/ActiveSessionDto";
import { AuthenticationError } from "../../Errors/HttpErrors";
import { Service } from "typedi";
import User from "../../Entities/Users/User";
import { UserDto } from "../../Dtos/Users/UserDto";

/**
 * @summary Controller for managing active user sessions.
 * @tags Active Sessions
 * @security jwt
 */
@Route("active-sessions")
@Tags("Active Sessions")
@Security("jwt")
@Service()
export class ActiveSessionsController extends Controller {
  constructor(private activeSessionService: ActiveSessionService) {
    super();
  }

  /**
   * @summary Retrieves all active sessions for the authenticated user.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<ActiveSessionResponseDto[]>} An array of active sessions.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Get("/")
  public async getAllUserSessions(
    @Request() request: ExpressRequest,
  ): Promise<ActiveSessionResponseDto[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user as UserDto;
    return this.activeSessionService.getAllUserSessions(companyId, userId);
  }

  /**
   * @summary Revokes a specific active session by its token hash.
   * @param {string} tokenHash - The hash of the token to revoke.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<void>} Nothing is returned upon successful revocation.
   * @throws {AuthenticationError} If the user is not authenticated.
   */
  @Delete("/{tokenHash}")
  public async revokeActiveSession(
    @Path() tokenHash: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    await this.activeSessionService.revokeActiveSession(tokenHash);
  }
}
