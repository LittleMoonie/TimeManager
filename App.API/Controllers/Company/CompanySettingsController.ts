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
import { AuthenticationError } from "../../Errors/HttpErrors";
import { UserService } from "../../Services/User/UserService";
import { Service } from "typedi";

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

  @Get("/")
  public async getCompanySettings(
    @Request() request: ExpressRequest,
  ): Promise<CompanySettingsResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    return this.companySettingsService.getCompanySettings(companyId);
  }

  @Put("/")
  @Security("jwt", ["admin"])
  public async updateCompanySettings(
    @Body() updateCompanySettingsDto: UpdateCompanySettingsDto,
    @Request() request: ExpressRequest,
  ): Promise<CompanySettingsResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
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
