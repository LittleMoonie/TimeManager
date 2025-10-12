import {
  Body, Controller, Get, Post, Put, Delete, Route, Tags, Path, Security, Request, Query,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { Service } from "typedi";

import { ActionCodeService } from "@/Services/Timesheet/ActionCodeService";
import { CreateActionCodeDto, UpdateActionCodeDto } from "@/Dtos/Timesheet/TimesheetDto";
import { ActionCode } from "@/Entities/Timesheets/ActionCode";
import User from "@/Entities/Users/User";

/**
 * @summary Controller for managing action codes.
 * @tags Action Codes
 * @security jwt
 */
@Route("action-codes")
@Tags("Action Codes")
@Security("jwt")
@Service()
export class ActionCodeController extends Controller {
  constructor(private readonly actionCodeService: ActionCodeService) {
    super();
  }

  /**
   * @summary Searches for action codes within the authenticated user's company.
   * @param request The Express request object, containing user information.
   * @param q Optional: The query string to search for.
   * @returns An array of matching action codes.
   */
  @Get("/")
  public async searchActionCodes(
    @Request() request: ExpressRequest,
    @Query() q?: string,
  ): Promise<ActionCode[]> {
    const me = request.user as User;
    return this.actionCodeService.search(me.companyId, q);
  }

  /**
   * @summary Retrieves an action code by its ID within the authenticated user's company.
   * @param id The ID of the action code to retrieve.
   * @param request The Express request object, containing user information.
   * @returns The action code details.
   * @throws {NotFoundError} If the action code is not found or does not belong to the specified company.
   */
  @Get("/{id}")
  public async getActionCode(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<ActionCode> {
    const me = request.user as User;
    return this.actionCodeService.getActionCodeById(me.companyId, id);
  }

  /**
   * @summary Creates a new action code within the authenticated user's company.
   * @param dto The data for creating the action code.
   * @param request The Express request object, containing user information.
   * @returns The newly created action code.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   */
  @Post("/")
  @Security("jwt", ["admin", "manager"])
  @SuccessResponse("201", "Action code created successfully")
  public async createActionCode(
    @Body() dto: CreateActionCodeDto,
    @Request() request: ExpressRequest,
  ): Promise<ActionCode> {
    const me = request.user as User;
    const created = await this.actionCodeService.create(me.companyId, me.id, dto);
    this.setStatus(201);
    return created;
  }

  /**
   * @summary Updates an existing action code within the authenticated user's company.
   * @param id The ID of the action code to update.
   * @param dto The data for updating the action code.
   * @param request The Express request object, containing user information.
   * @returns The updated action code details.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   * @throws {NotFoundError} If the action code is not found or does not belong to the specified company.
   */
  @Put("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async updateActionCode(
    @Path() id: string,
    @Body() dto: UpdateActionCodeDto,
    @Request() request: ExpressRequest,
  ): Promise<ActionCode> {
    const me = request.user as User;
    return this.actionCodeService.update(me.companyId, me.id, id, dto);
  }

  /**
   * @summary Deletes an action code by its ID within the authenticated user's company.
   * @param id The ID of the action code to delete.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves upon successful deletion.
   * @throws {NotFoundError} If the action code is not found or does not belong to the specified company.
   */
  @Delete("/{id}")
  @Security("jwt", ["admin", "manager"])
  @SuccessResponse("200", "Action code deleted successfully")
  public async deleteActionCode(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const me = request.user as User;
    await this.actionCodeService.delete(me.companyId, me.id, id);
  }
}