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
 * UserStatusService
 * - Thin layer over UserStatusRepository.
 * - Exposes helpers used by AuthenticationService and admin tools.
 */
@Service()
export class UserStatusService {
  constructor(private readonly userStatusRepository: UserStatusRepository) {}

  // ------------------------------------------------------------------- 
  // Helpers 
  // ------------------------------------------------------------------- 
  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map(e => e.toString()).join(", ")}`
      );
    }
  }

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
   * Fetch a status by its unique code (e.g., "ACTIVE", "SUSPENDED").
   * Returns null if not found. AuthenticationService handles the null case.
   */
  public async getUserStatusByCode(code: string): Promise<UserStatusResponseDto | null> {
    const userStatus = await this.userStatusRepository.findByCode(code);
    return userStatus ? this.toResponse(userStatus) : null;
  }

  /** Get a status by id. */
  public async getUserStatusById(id: string): Promise<UserStatusResponseDto | null> {
    const userStatus = await this.userStatusRepository.findById(id);
    return userStatus ? this.toResponse(userStatus) : null;
  }

  /** List all user statuses (useful for admin UI/setup). */
  public async listUserStatuses(): Promise<UserStatusResponseDto[]> {
    const userStatuses = await this.userStatusRepository.findAll();
    return userStatuses.map(this.toResponse);
  }

  /** Create a new user status. */
  public async createUserStatus(dto: CreateUserStatusDto): Promise<UserStatusResponseDto> {
    await this.ensureValidation(dto);

    const existing = await this.userStatusRepository.findByCode(dto.code);
    if (existing) {
      throw new UnprocessableEntityError("User status with this code already exists.");
    }

    const userStatus = await this.userStatusRepository.create(dto as UserStatus);
    return this.toResponse(userStatus);
  }

  /** Update an existing user status. */
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

  /** Soft delete a user status. */
  public async softDeleteUserStatus(id: string): Promise<void> {
    const userStatus = await this.userStatusRepository.findById(id);
    if (!userStatus) {
      throw new NotFoundError("User status not found.");
    }
    await this.userStatusRepository.softDelete(id);
  }

  /** Restore a soft-deleted user status. */
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

  /** Hard delete a user status. */
  public async hardDeleteUserStatus(id: string): Promise<void> {
    const userStatus = await this.userStatusRepository.findById(id, true);
    if (!userStatus) {
      throw new NotFoundError("User status not found.");
    }
    await this.userStatusRepository.hardDeleteUserStatus(id);
  }
}
