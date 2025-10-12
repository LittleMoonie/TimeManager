import {
  CreateUserStatusDto,
  UpdateUserStatusDto,
} from "../../Dtos/Users/UserStatusDto";
import { UserStatus } from "../../Entities/Users/UserStatus";
import { NotFoundError } from "../../Errors/HttpErrors";
import { UserStatusRepository } from "../../Repositories/Users/UserStatusRepository";

export class UserStatusService {
  private userStatusRepository = new UserStatusRepository();

  async createUserStatus(
    createUserStatusDto: CreateUserStatusDto,
  ): Promise<UserStatus> {
    return this.userStatusRepository.create(createUserStatusDto);
  }

  async getUserStatusById(id: string): Promise<UserStatus> {
    const userStatus = await this.userStatusRepository.findById(id);
    if (!userStatus) {
      throw new NotFoundError("UserStatus not found");
    }
    return userStatus;
  }

  async getUserStatusByCode(code: string): Promise<UserStatus> {
    const userStatus = await this.userStatusRepository.findByCode(code);
    if (!userStatus) {
      throw new NotFoundError("UserStatus not found");
    }
    return userStatus;
  }

  async getAllUserStatuses(): Promise<UserStatus[]> {
    return this.userStatusRepository.findAll();
  }

  async updateUserStatus(
    id: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<UserStatus> {
    await this.getUserStatusById(id);
    const updatedUserStatus = await this.userStatusRepository.update(
      id,
      updateUserStatusDto,
    );
    return updatedUserStatus!;
  }

  async deleteUserStatus(id: string): Promise<void> {
    await this.getUserStatusById(id);
    await this.userStatusRepository.delete(id);
  }
}
