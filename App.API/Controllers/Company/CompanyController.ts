import {
  Body,
  Controller,
  Post,
  Route,
  Tags,
  SuccessResponse,
  Security,
  Request,
  Get,
  Path,
  Put,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { CompanyService } from "../../Services/Company/CompanyService";
import {
  CreateCompanyDto,
  CompanyResponseDto,
  UpdateCompanyDto,
} from "../../Dtos/Company/CompanyDto";
import { UserService } from "../../Services/User/UserService";
import { Service } from "typedi";

import { UserDto } from "../../Dtos/Users/UserDto";
import User from "../../Entities/Users/User";
/**
 * @summary Controller for managing company entities.
 * @tags Companies
 * @security jwt
 */
@Route("companies")
@Tags("Companies")
@Security("jwt")
@Service()
export class CompanyController extends Controller {

  constructor(private companyService: CompanyService, private userService: UserService) {
    super();
    }

  /**
   * @summary Creates a new company.
   * @param {CreateCompanyDto} createCompanyDto - The data for creating the company.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<CompanyResponseDto>} The newly created company.
   */
  @Post("/")
  @Security("jwt", ["admin"])
  @SuccessResponse("201", "Company created successfully")
  public async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @Request() request: ExpressRequest,
  ): Promise<CompanyResponseDto> {
    const { id: userId, companyId } = request.user as UserDto;
    const actingUser = await this.userService.getUserById(companyId, userId);
    const company = await this.companyService.createCompany(
      actingUser,
      createCompanyDto,
    );
    this.setStatus(201);
    return company;
  }

  /**
   * @summary Retrieves a single company by its ID.
   * @param {string} id - The ID of the company to retrieve.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<CompanyResponseDto>} The company details.
   */
  @Get("/{id}")
  public async getCompany(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<CompanyResponseDto> {
    // In a real application, you would check if the user belongs to this company
    return this.companyService.getCompanyById(request.user as User, id);
  }
  /**
   * @summary Updates an existing company.
   * @param {string} id - The ID of the company to update.
   * @param {UpdateCompanyDto} updateCompanyDto - The data for updating the company.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<CompanyResponseDto>} The updated company details.
   */
  @Put("/{id}")
  @Security("jwt", ["admin"])
  public async updateCompany(
    @Path() id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() request: ExpressRequest,
  ): Promise<CompanyResponseDto> {
    const { id: userId, companyId } = request.user as UserDto;
    const actingUser = await this.userService.getUserById(companyId, userId);

    const updatedCompany = await this.companyService.updateCompany(
      actingUser,
      id,
      updateCompanyDto,
    );
    return updatedCompany;
  }
}
