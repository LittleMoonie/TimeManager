import {
  Body,
  Controller,
  Get,
  Put,
  Route,
  Tags,
  Security,
  Request,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { CompanySettingsService } from "../../Services/Company/CompanySettingsService";
import {
  CompanySettingsResponseDto,
  UpdateCompanySettingsDto,
} from "../../Dtos/Company/CompanySettingsDto";
import { UserService } from "../../Services/User/UserService";
import { Service } from "typedi";
import { UserDto } from "../../Dtos/Users/UserDto";

/**
 * @summary Controller for managing company-specific settings.
 * @tags Company Settings
 * @security jwt
 */
@Route("company-settings")
@Tags("Company Settings")
@Security("jwt")
@Service()
export class CompanySettingsController extends Controller {
  constructor(
    private companySettingsService: CompanySettingsService,
    private userService: UserService,
  ) {
    super();
  }

  /**
   * @summary Retrieves the company settings for the authenticated user's company.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<CompanySettingsResponseDto>} The company settings.
   */
  @Get("/")
  public async getCompanySettings(
    @Request() request: ExpressRequest,
  ): Promise<CompanySettingsResponseDto> {
    const { companyId } = request.user as UserDto;
    return this.companySettingsService.getCompanySettings(companyId);
  }

  /**
   * @summary Updates the company settings for the authenticated user's company.
   * @param {UpdateCompanySettingsDto} updateCompanySettingsDto - The data for updating company settings.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<CompanySettingsResponseDto>} The updated company settings.
   */
  @Put("/")
  @Security("jwt", ["admin"])
  public async updateCompanySettings(
    @Body() updateCompanySettingsDto: UpdateCompanySettingsDto,
    @Request() request: ExpressRequest,
  ): Promise<CompanySettingsResponseDto> {
    const { id: userId, companyId } = request.user as UserDto;
    const actingUser = await this.userService.getUserById(companyId, userId);

    const updatedSettings =
      await this.companySettingsService.updateCompanySettings(
        actingUser,
        companyId,
        updateCompanySettingsDto,
      );
    return updatedSettings;
  }
}
