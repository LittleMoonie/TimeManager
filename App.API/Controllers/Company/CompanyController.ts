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
import { AuthenticationError } from "../../Errors/HttpErrors";
import { UserService } from "../../Services/User/UserService";
import { CompanyRepository } from "../../Repositories/Companies/CompanyRepository";
import { RolePermissionRepository } from "../../Repositories/Users/RolePermissionRepository";
import { RolePermissionService } from "../../Services/User/RolePermissionService";
import { Service } from "typedi";

@Route("companies")
@Tags("Companies")
@Security("jwt")
@Service()
export class CompanyController extends Controller {

  constructor(private companyService: CompanyService, private userService: UserService) {
    super();
    }

  @Post("/")
  @Security("jwt", ["admin"])
  @SuccessResponse("201", "Company created successfully")
  public async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @Request() request: ExpressRequest,
  ): Promise<CompanyResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
    const actingUser = await this.userService.getUserById(companyId, userId);

    const company = await this.companyService.createCompany(
      actingUser,
      createCompanyDto,
    );
    this.setStatus(201);
    return company;
  }

  @Get("/{id}")
  public async getCompany(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<CompanyResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    // In a real application, you would check if the user belongs to this company
    return this.companyService.getCompanyById(request.user, id);
  }

  @Put("/{id}")
  @Security("jwt", ["admin"])
  public async updateCompany(
    @Path() id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() request: ExpressRequest,
  ): Promise<CompanyResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
    const actingUser = await this.userService.getUserById(companyId, userId);

    const updatedCompany = await this.companyService.updateCompany(
      actingUser,
      id,
      updateCompanyDto,
    );
    return updatedCompany;
  }
}
