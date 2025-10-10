import { Body, Controller, Delete, Get, Path, Post, Put, Query, Request, Route, Security, Tags } from 'tsoa';
import { ActionCode } from '../models/actionCode';
import { Request as ExRequest } from 'express';
import { Service } from 'typedi';
import { CreateActionCodeDto, UpdateActionCodeDto } from '../dto/ActionCodeDto';

@Route('/api/v1/action-codes')
@Tags('Action Codes')
@Security('jwt')
@Service()
export class ActionCodeController extends Controller {

  /**
   * Retrieve a list of action codes for the organization.
   * @param request The express request object, containing user and organization context.
   * @param q Optional search query to filter action codes by name.
   * @returns A list of action codes.
   */
  @Get('/')
  public async listActionCodes(
    @Request() request: ExRequest,
    @Query() q?: string,
  ): Promise<ActionCode[]> {
    const { organization } = request;
    return this.listActionCodes(request, q);
  }

  /**
   * Create a new action code.
   * Only Managers/Admins can create action codes.
   * @param request The express request object, containing user and organization context.
   * @param requestBody The action code creation payload.
   * @returns The newly created action code.
   */
  @Post('/')
  @Security('jwt', ['manager', 'admin'])
  public async createActionCode(
    @Request() request: ExRequest,
    @Body() requestBody: CreateActionCodeDto,
  ): Promise<ActionCode> {
    const { user, organization } = request;
    return this.createActionCode(request, requestBody);
  }

  /**
   * Update an existing action code.
   * Only Managers/Admins can update action codes.
   * @param request The express request object, containing user and organization context.
   * @param id The UUID of the action code to update.
   * @param requestBody The action code update payload.
   * @returns The updated action code.
   */
  @Put('/{id}')
  @Security('jwt', ['manager', 'admin'])
  public async updateActionCode(
    @Request() request: ExRequest,
    @Path() id: string,
    @Body() requestBody: UpdateActionCodeDto,
  ): Promise<ActionCode | null> {
    const { user, organization } = request;
    return this.updateActionCode(request, id, requestBody);
  }

  /**
   * Delete an action code.
   * Only Managers/Admins can delete action codes.
   * @param request The express request object, containing user and organization context.
   * @param id The UUID of the action code to delete.
   */
  @Delete('/{id}')
  @Security('jwt', ['manager', 'admin'])
  public async deleteActionCode(
    @Request() request: ExRequest,
    @Path() id: string,
  ): Promise<void> {
    const { user, organization } = request;
    await this.deleteActionCode(request, id);
  }
}
