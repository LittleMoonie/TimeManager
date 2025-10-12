import { Service } from "typedi";
import { validate } from "class-validator";

import { Permission } from "@/Entities/Roles/Permission";
import { ForbiddenError, NotFoundError, UnprocessableEntityError } from "@/Errors/HttpErrors";
import { PermissionRepository } from "@/Repositories/Roles/PermissionRepository";
import { RolePermissionService } from "@/Services/RoleService/RolePermissionService";
import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from "@/Dtos/Roles/RoleDto";
import User from "@/Entities/Users/User";

/**
 * @description Service layer for managing Permission entities. This service provides business logic
 * for permission-related operations, including CRUD for permissions, with integrated permission checks.
 */
@Service()
export class PermissionService {
  /**
   * @description Initializes the PermissionService with necessary repositories and services.
   * @param permissionRepository The repository for Permission entities.
   * @param rolePermissionService The service for checking user permissions.
   */
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly rolePermissionService: RolePermissionService
  ) {}

  /**
   * @description Ensures that a given DTO (Data Transfer Object) is valid by performing class-validator validation.
   * @param dto The DTO object to validate.
   * @returns A Promise that resolves if validation passes.
   * @throws {UnprocessableEntityError} If validation fails, containing details of the validation errors.
   */
  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map(e => e.toString()).join(", ")}`
      );
    }
  }

  /**
   * @description Creates a new permission within a specified company. Requires 'create_permission' permission.
   * @param companyId The unique identifier of the company where the permission will be created.
   * @param currentUser The user performing the action.
   * @param dto The CreatePermissionDto containing the new permission's name and optional description.
   * @returns A Promise that resolves to the newly created Permission entity.
   * @throws {ForbiddenError} If the current user does not have 'create_permission' permission.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   */
  async createPermission(
    companyId: string,
    currentUser: User,
    dto: CreatePermissionDto,
  ): Promise<Permission> {
    if (!(await this.rolePermissionService.checkPermission(currentUser, "create_permission"))) {
      throw new ForbiddenError("User does not have permission to create permissions.");
    }

    await this.ensureValidation(dto);

    return this.permissionRepository.create({
      companyId,
      ...dto,
    });
  }

  /**
   * @description Retrieves a permission by its ID within a specific company.
   * @param companyId The unique identifier of the company.
   * @param permissionId The unique identifier of the permission.
   * @returns A Promise that resolves to the Permission entity.
   * @throws {NotFoundError} If the permission is not found or does not belong to the specified company.
   */
  async getPermissionById(
    companyId: string,
    permissionId: string,
  ): Promise<Permission> {
    const permission = await this.permissionRepository.findById(permissionId);
    if (!permission || permission.companyId !== companyId) {
      throw new NotFoundError("Permission not found");
    }
    return permission;
  }

  /**
   * @description Retrieves a permission by its name within a specific company.
   * @param companyId The unique identifier of the company.
   * @param name The name of the permission.
   * @returns A Promise that resolves to the Permission entity.
   * @throws {NotFoundError} If the permission is not found.
   */
  async getPermissionByName(
    companyId: string,
    name: string,
  ): Promise<Permission> {
    const permission = await this.permissionRepository.findByName(companyId, name);
    if (!permission) {
      throw new NotFoundError("Permission not found");
    }
    return permission;
  }

  /**
   * @description Retrieves all permissions belonging to a specific company.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to an array of Permission entities.
   */
  async getAllPermissions(companyId: string): Promise<Permission[]> {
    return this.permissionRepository.findAllInCompany(companyId);
  }

  /**
   * @description Updates an existing permission within a specified company. Requires 'update_permission' permission.
   * @param companyId The unique identifier of the company.
   * @param currentUser The user performing the action.
   * @param permissionId The unique identifier of the permission to update.
   * @param dto The UpdatePermissionDto containing the updated permission data.
   * @returns A Promise that resolves to the updated Permission entity.
   * @throws {ForbiddenError} If the current user does not have 'update_permission' permission.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   * @throws {NotFoundError} If the permission is not found or not found after update.
   */
  async updatePermission(
    companyId: string,
    currentUser: User,
    permissionId: string,
    dto: UpdatePermissionDto,
  ): Promise<Permission> {
    if (!(await this.rolePermissionService.checkPermission(currentUser, "update_permission"))) {
      throw new ForbiddenError("User does not have permission to update permissions.");
    }

    await this.ensureValidation(dto);
    await this.getPermissionById(companyId, permissionId);

    const updated = await this.permissionRepository.update(permissionId, dto);
    if (updated) return updated;

    const reloaded = await this.permissionRepository.findById(permissionId);
    if (!reloaded || reloaded.companyId !== companyId) {
      throw new NotFoundError("Permission not found after update");
    }
    return reloaded;
  }

  /**
   * @description Deletes a permission within a specified company. Requires 'delete_permission' permission.
   * @param companyId The unique identifier of the company.
   * @param currentUser The user performing the action.
   * @param permissionId The unique identifier of the permission to delete.
   * @returns A Promise that resolves when the deletion is complete.
   * @throws {ForbiddenError} If the current user does not have 'delete_permission' permission.
   * @throws {NotFoundError} If the permission is not found.
   */
  async deletePermission(
    companyId: string,
    currentUser: User,
    permissionId: string,
  ): Promise<void> {
    if (!(await this.rolePermissionService.checkPermission(currentUser, "delete_permission"))) {
      throw new ForbiddenError("User does not have permission to delete permissions.");
    }

    const permission = await this.getPermissionById(companyId, permissionId);
    await this.permissionRepository.delete(permission.id);
  }
}
