import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { ActionCode } from "../../Entities/Timesheets/ActionCode";
import { Request as ExRequest } from "express";
import { Service } from "typedi";
import {
  CreateActionCodeDto,
  UpdateActionCodeDto,
} from "../../Dtos/Timesheet/ActionCodeDto";
import { ActionCodeService } from "../../Services/Timesheet/ActionCodeService";
import { AuthenticationError } from "../../Errors/HttpErrors";

@Route("action-codes")
@Tags("Action Codes")
@Security("jwt")
@Service()
export class ActionCodeController extends Controller {
  constructor(private actionCodeService: ActionCodeService) {
    super();
  }

  @Get("/")
  public async listActionCodes(
    @Request() request: ExRequest,
    @Query() q?: string,
  ): Promise<ActionCode[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    return this.actionCodeService.search(companyId, q);
  }

  @Post("/")
  @Security("jwt", ["manager", "admin"])
  public async createActionCode(
    @Request() request: ExRequest,
    @Body() requestBody: CreateActionCodeDto,
  ): Promise<ActionCode> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: actorUserId, companyId } = request.user;
    return this.actionCodeService.create(companyId, actorUserId, requestBody);
  }

  @Put("/{id}")
  @Security("jwt", ["manager", "admin"])
  public async updateActionCode(
    @Request() request: ExRequest,
    @Path() id: string,
    @Body() requestBody: UpdateActionCodeDto,
  ): Promise<ActionCode> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: actorUserId, companyId } = request.user;
    return this.actionCodeService.update(
      companyId,
      actorUserId,
      id,
      requestBody,
    );
  }

  @Delete("/{id}")
  @Security("jwt", ["manager", "admin"])
  public async deleteActionCode(
    @Request() request: ExRequest,
    @Path() id: string,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: actorUserId, companyId } = request.user;
    await this.actionCodeService.delete(companyId, actorUserId, id);
  }
}
