import { Service } from "typedi";
import { CompanyRepository } from "../../Repositories/Companies/CompanyRepository";
import {
  CreateCompanyDto,
  UpdateCompanyDto,
} from "../../Dtos/Company/CompanyDto";
import { Company } from "../../Entities/Companies/Company";
import { NotFoundError, ForbiddenError } from "../../Errors/HttpErrors";
import User from "../../Entities/Users/User";
import { UserService } from "../User/UserService";
import { RolePermissionService } from "../User/RolePermissionService";

@Service()
export class CompanyService {
  constructor(
    private companyRepository: CompanyRepository,
    private userService: UserService,
    private rolePermissionService: RolePermissionService,
  ) {}

  public async createCompany(
    actingUser: User | null,
    createCompanyDto: CreateCompanyDto,
  ): Promise<Company> {
    // Permission check: Only users with 'create_company' permission can create a company
    if (
      actingUser &&
      !(await this.rolePermissionService.checkPermission(
        actingUser,
        "create_company",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to create companies.",
      );
    }
    return this.companyRepository.create(createCompanyDto);
  }

  public async getCompanyById(
    actingUser: User,
    companyId: string,
  ): Promise<Company> {
    if (
      !(await this.rolePermissionService.checkPermission(
        actingUser,
        "view_company",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to view companies.",
      );
    }
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError("Company not found");
    }
    return company;
  }

  public async updateCompany(
    actingUser: User,
    companyId: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    // Permission check: Only users with 'update_company' permission can update a company
    if (
      !(await this.rolePermissionService.checkPermission(
        actingUser,
        "update_company",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to update companies.",
      );
    }
    const company = await this.getCompanyById(actingUser, companyId);
    if (company.id !== companyId) {
      throw new ForbiddenError(
        "User does not have permission to update this company.",
      );
    }
    const updatedCompany = await this.companyRepository.update(
      companyId,
      updateCompanyDto,
    );
    return updatedCompany!;
  }

  public async addUserToCompany(
    actingUser: User,
    companyId: string,
    userId: string,
  ): Promise<void> {
    // Permission check: Only users with 'add_user_to_company' permission can add a user to a company
    if (
      !(await this.rolePermissionService.checkPermission(
        actingUser,
        "add_user_to_company",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to add users to companies.",
      );
    }
    await this.userService.updateUser(companyId, userId, actingUser, {
      companyId: companyId,
    });
  }
}
