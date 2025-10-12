import {
  Body, Controller, Post, Route, Tags, SuccessResponse, Security, Request, Get, Path, Put,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { Service } from "typedi";

import { CompanyService } from "@/Services/Companies/CompanyService";
import { CreateCompanyDto, UpdateCompanyDto } from "@/Dtos/Companies/CompanyDto";
import { Company } from "@/Entities/Companies/Company";

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
  constructor(private companyService: CompanyService) {
    super();
  }

  /** Create a new company */
  @Post("/")
  @Security("jwt", ["admin"])
  @SuccessResponse("201", "Company created successfully")
  public async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @Request() _request: ExpressRequest,
  ): Promise<Company> {
    const company = await this.companyService.createCompany(createCompanyDto);
    this.setStatus(201);
    return company;
  }

  /** Get a company by id */
  @Get("/{id}")
  public async getCompany(@Path() id: string): Promise<Company> {
    return this.companyService.getCompanyById(id);
  }

  /** Update a company */
  @Put("/{id}")
  @Security("jwt", ["admin"])
  public async updateCompany(
    @Path() id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() _request: ExpressRequest,
  ): Promise<Company> {
    return this.companyService.updateCompany(id, updateCompanyDto);
  }
}
