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
import { UserService } from "../../Services/User/UserService";
import { Service } from "typedi";

@Route("active-sessions")
@Tags("Active Sessions")
@Security("jwt")
@Service()
export class ActiveSessionsController extends Controller {
  constructor(private activeSessionService: ActiveSessionService) {
    super();
  }

  @Get("/")
  public async getAllUserSessions(
    @Request() request: ExpressRequest,
  ): Promise<ActiveSessionResponseDto[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
    return this.activeSessionService.getAllUserSessions(companyId, userId);
  }

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
