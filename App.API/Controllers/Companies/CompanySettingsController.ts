import { Request as ExpressRequest } from 'express';
import {
  Body,
  Controller,
  Route,
  Tags,
  SuccessResponse,
  Security,
  Request,
  Get,
  Put,
  Delete,
} from 'tsoa';
import { Service } from 'typedi';

import { UpdateCompanySettingsDto } from '../../Dtos/Companies/CompanyDto';
import { CompanySettings } from '../../Entities/Companies/CompanySettings';
import User from '../../Entities/Users/User';
import { CompanySettingsService } from '../../Services/Companies/CompanySettingsService';

/**
 * @summary Controller for managing company settings.
 * @tags Company Settings
 * @security jwt
 */
@Route('company-settings')
@Tags('Company Settings')
@Security('jwt')
@Service()
export class CompanySettingsController extends Controller {
  constructor(private companySettingsService: CompanySettingsService) {
    super();
  }

  /**
   * @summary Retrieves the company settings for the authenticated user's company.
   * @param request The Express request object, containing user information.
   * @returns The company settings.
   * @throws {NotFoundError} If company settings are not found.
   */
  @Get('/')
  public async getCompanySettings(@Request() request: ExpressRequest): Promise<CompanySettings> {
    const me = request.user as User;
    return this.companySettingsService.getCompanySettings(me.companyId);
  }

  /**
   * @summary Updates the company settings for the authenticated user's company.
   * @param updateCompanySettingsDto The data for updating the company settings.
   * @param request The Express request object, containing user information.
   * @returns The updated company settings.
   * @throws {ForbiddenError} If the user does not have permission to update company settings.
   * @throws {UnprocessableEntityError} If validation fails.
   * @throws {NotFoundError} If company settings are not found.
   */
  @Put('/')
  @Security('jwt', ['admin', 'manager'])
  public async updateCompanySettings(
    @Body() updateCompanySettingsDto: UpdateCompanySettingsDto,
    @Request() request: ExpressRequest,
  ): Promise<CompanySettings> {
    const me = request.user as User;
    return this.companySettingsService.updateCompanySettings(me, updateCompanySettingsDto);
  }

  /**
   * @summary Deletes the company settings for the authenticated user's company.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves when the deletion is complete.
   * @throws {NotFoundError} If company settings are not found.
   */
  @Delete('/')
  @Security('jwt', ['admin'])
  @SuccessResponse('204', 'Company settings deleted successfully')
  public async deleteCompanySettings(@Request() request: ExpressRequest): Promise<void> {
    const me = request.user as User;
    await this.companySettingsService.deleteCompanySettings(me.companyId);
    this.setStatus(204);
  }
}
