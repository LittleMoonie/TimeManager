import { Request as ExpressRequest } from 'express';
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
} from 'tsoa';
import { Service } from 'typedi';

import { CreateCompanyDto, UpdateCompanyDto } from '../../Dtos/Companies/CompanyDto';
import { Company } from '../../Entities/Companies/Company';
import { CompanyService } from '../../Services/Companies/CompanyService';

/**
 * @summary Controller for managing company entities.
 * @tags Companies
 * @security jwt
 */
@Route('companies')
@Tags('Companies')
@Security('jwt')
@Service()
export class CompanyController extends Controller {
  constructor(private companyService: CompanyService) {
    super();
  }

  /**
   * @summary Creates a new company.
   * @param createCompanyDto The data for creating the company.
   * @param _request The Express request object (unused, but required by TSOA).
   * @returns The newly created company.
   * @throws {UnprocessableEntityError} If validation fails.
   */
  @Post('/')
  @Security('jwt', ['admin'])
  @SuccessResponse('201', 'Company created successfully')
  public async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Request() _request: ExpressRequest,
  ): Promise<Company> {
    const company = await this.companyService.createCompany(createCompanyDto);
    this.setStatus(201);
    return company;
  }

  /**
   * @summary Retrieves a company by its ID.
   * @param id The ID of the company to retrieve.
   * @returns The company details.
   * @throws {NotFoundError} If the company is not found.
   */
  @Get('/{id}')
  public async getCompany(@Path() id: string): Promise<Company> {
    return this.companyService.getCompanyById(id);
  }

  /**
   * @summary Updates an existing company.
   * @param id The ID of the company to update.
   * @param updateCompanyDto The data for updating the company.
   * @param _request The Express request object (unused, but required by TSOA).
   * @returns The updated company details.
   * @throws {UnprocessableEntityError} If validation fails.
   * @throws {NotFoundError} If the company to update is not found.
   */
  @Put('/{id}')
  @Security('jwt', ['admin'])
  public async updateCompany(
    @Path() id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Request() _request: ExpressRequest,
  ): Promise<Company> {
    return this.companyService.updateCompany(id, updateCompanyDto);
  }
}
