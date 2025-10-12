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
import { UserDto } from "../../Dtos/Users/UserDto";

/**
 * @summary Controller for managing action codes used in timesheets.
 * @tags Action Codes
 * @security jwt
 */
@Route("action-codes")
@Tags("Action Codes")
@Security("jwt")
@Service()
export class ActionCodeController extends Controller {
  constructor(private actionCodeService: ActionCodeService) {
    super();
  }

  /**
   * @summary Retrieves a list of action codes, optionally filtered by a query string.
   * @param {ExRequest} request - The Express request object, containing user information.
   * @param {string} [q] - Optional query string to filter action codes.
   * @returns {Promise<ActionCode[]>} An array of action codes.
   */
  @Get("/")
  public async listActionCodes(
    @Request() request: ExRequest,
    @Query() q?: string,
  ): Promise<ActionCode[]> {
    const { companyId } = request.user as UserDto;
    return this.actionCodeService.search(companyId, q);
  }

  /**
   * @summary Creates a new action code.
   * @param {ExRequest} request - The Express request object, containing user information.
   * @param {CreateActionCodeDto} requestBody - The data for creating the action code.
   * @returns {Promise<ActionCode>} The newly created action code.
   */
  @Post("/")
  @Security("jwt", ["manager", "admin"])
  public async createActionCode(
    @Request() request: ExRequest,
    @Body() requestBody: CreateActionCodeDto,
  ): Promise<ActionCode> {
    const { id: actorUserId, companyId } = request.user as UserDto;
    return this.actionCodeService.create(companyId, actorUserId, requestBody);
  }

  /**
   * @summary Updates an existing action code.
   * @param {ExRequest} request - The Express request object, containing user information.
   * @param {string} id - The ID of the action code to update.
   * @param {UpdateActionCodeDto} requestBody - The data for updating the action code.
   * @returns {Promise<ActionCode>} The updated action code.
   */
  @Put("/{id}")
  @Security("jwt", ["manager", "admin"])
  public async updateActionCode(
    @Request() request: ExRequest,
    @Path() id: string,
    @Body() requestBody: UpdateActionCodeDto,
  ): Promise<ActionCode> {
    const { id: actorUserId, companyId } = request.user as UserDto;
    return this.actionCodeService.update(
      companyId,
      actorUserId,
      id,
      requestBody,
    );
  }

  /**
   * @summary Deletes an action code by its ID.
   * @param {ExRequest} request - The Express request object, containing user information.
   * @param {string} id - The ID of the action code to delete.
   * @returns {Promise<void>} Nothing is returned upon successful deletion.
   */
  @Delete("/{id}")
  @Security("jwt", ["manager", "admin"])
  public async deleteActionCode(
    @Request() request: ExRequest,
    @Path() id: string,
  ): Promise<void> {
    const { id: actorUserId, companyId } = request.user as UserDto;
    await this.actionCodeService.delete(companyId, actorUserId, id);
  }
}
