import { Service } from "typedi";
import { validate } from "class-validator";

import { UserStatusRepository } from "@/Repositories/Users/UserStatusRepository";
import { UserStatus } from "@/Entities/Users/UserStatus";
import { NotFoundError, UnprocessableEntityError } from "@/Errors/HttpErrors";
import {
  CreateUserStatusDto,
  UpdateUserStatusDto,
  UserStatusResponseDto,
} from "@/Dtos/Users/UserStatusDto";

/**
 * @description Service layer for managing UserStatus entities. This service provides business logic
 * for user status-related operations, acting as a thin layer over the UserStatusRepository.
 * It handles data validation, entity-to-DTO conversion, and error handling.
 */
@Service()
export class UserStatusService {
  /**
   * @description Initializes the UserStatusService with the UserStatusRepository.
   * @param userStatusRepository The repository for UserStatus entities, injected by TypeDI.
   */
  constructor(private readonly userStatusRepository: UserStatusRepository) {}

  // ------------------------------------------------------------------- 
  // Helpers 
  // ------------------------------------------------------------------- 
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
   * @description Converts a UserStatus entity to a UserStatusResponseDto.
   * @param userStatus The UserStatus entity to convert.
   * @returns The converted UserStatusResponseDto.
   */
  private toResponse(userStatus: UserStatus): UserStatusResponseDto {
    return {
      id: userStatus.id,
      code: userStatus.code,
      name: userStatus.name,
      description: userStatus.description ?? undefined,
      canLogin: userStatus.canLogin,
      isTerminal: userStatus.isTerminal,
    };
  }

  // ------------------------------------------------------------------- 
  // Public Methods 
  // ------------------------------------------------------------------- 

  /**
   * @description Fetches a user status by its unique machine-readable code.
   * @param code The unique code of the status (e.g., "ACTIVE", "SUSPENDED").
   * @returns A Promise that resolves to the UserStatusResponseDto or null if no status is found with the given code.
   */
  public async getUserStatusByCode(code: string): Promise<UserStatusResponseDto | null> {
    const userStatus = await this.userStatusRepository.findByCode(code);
    return userStatus ? this.toResponse(userStatus) : null;
  }

  /**
   * @description Fetches a user status by its unique identifier.
   * @param id The unique identifier of the user status.
   * @returns A Promise that resolves to the UserStatusResponseDto or null if no status is found with the given ID.
   */
  public async getUserStatusById(id: string): Promise<UserStatusResponseDto | null> {
    const userStatus = await this.userStatusRepository.findById(id);
    return userStatus ? this.toResponse(userStatus) : null;
  }

  /**
   * @description Lists all available user statuses.
   * @returns A Promise that resolves to an array of UserStatusResponseDto objects.
   */
  public async listUserStatuses(): Promise<UserStatusResponseDto[]> {
    const userStatuses = await this.userStatusRepository.findAll();
    return userStatuses.map(this.toResponse);
  }

  /**
   * @description Creates a new user status.
   * @param dto The CreateUserStatusDto containing the data for the new user status.
   * @returns A Promise that resolves to the newly created UserStatusResponseDto.
   * @throws {UnprocessableEntityError} If validation fails or a user status with the same code already exists.
   */
  public async createUserStatus(dto: CreateUserStatusDto): Promise<UserStatusResponseDto> {
    await this.ensureValidation(dto);

    const existing = await this.userStatusRepository.findByCode(dto.code);
    if (existing) {
      throw new UnprocessableEntityError("User status with this code already exists.");
    }

    const userStatus = await this.userStatusRepository.create(dto as UserStatus);
    return this.toResponse(userStatus);
  }

  /**
   * @description Updates an existing user status.
   * @param id The unique identifier of the user status to update.
   * @param dto The UpdateUserStatusDto containing the updated data for the user status.
   * @returns A Promise that resolves to the updated UserStatusResponseDto.
   * @throws {NotFoundError} If the user status to update is not found.
   * @throws {UnprocessableEntityError} If validation fails or an attempt is made to change the code to one that already exists.
   */
  public async updateUserStatus(id: string, dto: UpdateUserStatusDto): Promise<UserStatusResponseDto> {
    await this.ensureValidation(dto);

    const userStatus = await this.userStatusRepository.findById(id);
    if (!userStatus) {
      throw new NotFoundError("User status not found.");
    }

    if (dto.code && dto.code !== userStatus.code) {
      const existing = await this.userStatusRepository.findByCode(dto.code);
      if (existing && existing.id !== id) {
        throw new UnprocessableEntityError("User status with this code already exists.");
      }
    }

    const updatedUserStatus = await this.userStatusRepository.update(id, dto as Partial<UserStatus>);
    if (!updatedUserStatus) {
      throw new NotFoundError("User status not found after update.");
    }
    return this.toResponse(updatedUserStatus);
  }

  /**
   * @description Soft deletes a user status by its unique identifier. The record remains in the database but is marked as deleted.
   * @param id The unique identifier of the user status to soft delete.
   * @returns A Promise that resolves when the soft deletion is complete.
   * @throws {NotFoundError} If the user status to soft delete is not found.
   */
  public async softDeleteUserStatus(id: string): Promise<void> {
    const userStatus = await this.userStatusRepository.findById(id);
    if (!userStatus) {
      throw new NotFoundError("User status not found.");
    }
    await this.userStatusRepository.softDelete(id);
  }

  /**
   * @description Restores a soft-deleted user status by its unique identifier.
   * @param id The unique identifier of the user status to restore.
   * @returns A Promise that resolves to the restored UserStatusResponseDto.
   * @throws {NotFoundError} If the user status to restore is not found or not found after restoration.
   */
  public async restoreUserStatus(id: string): Promise<UserStatusResponseDto> {
    const userStatus = await this.userStatusRepository.findById(id, true);
    if (!userStatus) {
      throw new NotFoundError("User status not found.");
    }
    await this.userStatusRepository.restore(id);
    const restoredUserStatus = await this.userStatusRepository.findById(id);
    if (!restoredUserStatus) {
      throw new NotFoundError("User status not found after restore.");
    }
    return this.toResponse(restoredUserStatus);
  }

  /**
   * @description Permanently deletes a user status by its unique identifier from the database. This operation is irreversible.
   * @param id The unique identifier of the user status to hard delete.
   * @returns A Promise that resolves when the hard deletion is complete.
   * @throws {NotFoundError} If the user status to hard delete is not found.
   */
  public async hardDeleteUserStatus(id: string): Promise<void> {
    const userStatus = await this.userStatusRepository.findById(id, true);
    if (!userStatus) {
      throw new NotFoundError("User status not found.");
    }
    await this.userStatusRepository.hardDeleteUserStatus(id);
  }
}
