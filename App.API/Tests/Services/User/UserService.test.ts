import { UserService } from "../../../Services/User/UserService";
import { UserRepository } from "../../../Repositories/Users/UserRepository";
import { UserActivityLogService } from "../../../Services/Logs/User/UserActivityLogService";
import { RoleService } from "../../../Services/RoleService/RoleService";
import { RolePermissionService } from "../../../Services/User/RolePermissionService";
import {
  NotFoundError,
  ForbiddenError,
} from "../../../Errors/HttpErrors";
import User from "../../../Entities/Users/User";
import { UserStatus } from "../../../Entities/Users/UserStatus";
import { Repository } from "typeorm";
import * as argon2 from "argon2";

jest.mock("argon2");

describe("UserService", () => {
  let service: UserService;
  let userRepository: jest.Mocked<Partial<UserRepository>>;
  let userStatusRepository: jest.Mocked<Partial<Repository<UserStatus>>>;
  let userActivityLogService: jest.Mocked<Partial<UserActivityLogService>>;
  let roleService: jest.Mocked<Partial<RoleService>>;
  let rolePermissionService: jest.Mocked<Partial<RolePermissionService>>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    userStatusRepository = {
      findOne: jest.fn(),
    };

    userActivityLogService = {
      log: jest.fn(),
    };

    roleService = {
      getRoleById: jest.fn(),
    };

    rolePermissionService = {
      checkPermission: jest.fn(),
    };

    service = new UserService(
      userRepository as any,
      userStatusRepository as any,
      userActivityLogService as any,
      roleService as any,
      rolePermissionService as any
    );

    jest.clearAllMocks();
  });

  // ---------------- createUser ----------------
  describe("createUser", () => {
    it("creates user, hashes password, and logs activity", async () => {
      const companyId = "company-id";
      const currentUser = { id: "current-user-id" } as User;
      const createDto = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "123456",
        roleId: "role-id",
      };

      const role = { id: "role-id", name: "employee" };
      const newUser = { id: "user-id", ...createDto, role, companyId };

      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);
      (roleService.getRoleById as jest.Mock).mockResolvedValue(role as any);
      (argon2.hash as jest.Mock).mockResolvedValue("hashed-password");
      (userRepository.create as jest.Mock).mockReturnValue(newUser as any);
      (userRepository.save as jest.Mock).mockResolvedValue(newUser as any);

      const result = await service.createUser(companyId, currentUser, createDto);

      expect(rolePermissionService.checkPermission).toHaveBeenCalledWith(currentUser, "create_user");
      expect(roleService.getRoleById).toHaveBeenCalledWith(createDto.roleId);
      expect(argon2.hash).toHaveBeenCalledWith(createDto.password);
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: createDto.email,
        passwordHash: "hashed-password",
      }));
      expect(userActivityLogService.log).toHaveBeenCalled();
      expect(result).toEqual(newUser);
    });

    it("throws ForbiddenError if user lacks permission", async () => {
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(false);

      await expect(
        service.createUser("company-id", { id: "x" } as User, { email: "a" } as any)
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError if role does not exist", async () => {
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);
      (roleService.getRoleById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createUser("company-id", { id: "x" } as User, {
          email: "a",
          password: "p",
          roleId: "missing",
        } as any)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ---------------- getUserById ----------------
  describe("getUserById", () => {
    it("returns an existing user", async () => {
      const user = { id: "user-id" } as User;
      (userRepository.findById as jest.Mock).mockResolvedValue(user);

      const result = await service.getUserById("user-id");
      expect(result).toEqual(user);
    });

    it("throws NotFoundError if user not found", async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getUserById("x")).rejects.toThrow(NotFoundError);
    });
  });

  // ---------------- updateUser ----------------
  describe("updateUser", () => {
    it("updates user, hashes password, changes role/status, logs activity", async () => {
      const userId = "u1";
      const currentUser = { id: "admin" } as User;
      const updateDto = {
        password: "newpass",
        roleId: "r2",
        statusId: "s2",
      };
      const existingUser = { id: userId } as User;
      const newRole = { id: "r2" };
      const newStatus = { id: "s2" } as UserStatus;

      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);
      (userRepository.findById as jest.Mock).mockResolvedValue(existingUser);
      (argon2.hash as jest.Mock).mockResolvedValue("hashed");
      (roleService.getRoleById as jest.Mock).mockResolvedValue(newRole as any);
      (userStatusRepository.findOne as jest.Mock).mockResolvedValue(newStatus);
      (userRepository.save as jest.Mock).mockResolvedValue({ ...existingUser, ...updateDto });

      const companyId = "company-id";
      
      const result = await service.updateUser(companyId, userId, currentUser, updateDto);

      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        passwordHash: "hashed",
        role: newRole,
        status: newStatus,
      }));
      expect(userActivityLogService.log).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(updateDto));
    });
  });

  // ---------------- deleteUser ----------------
  describe("deleteUser", () => {
    it("soft deletes user and logs activity", async () => {
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);
      (userRepository.softDelete as jest.Mock).mockResolvedValue({ affected: 1 } as any);

      await service.deleteUser("cid", "uid", { id: "admin" } as User);

      expect(userRepository.softDelete).toHaveBeenCalledWith("uid");
      expect(userActivityLogService.log).toHaveBeenCalled();
    });

    it("throws NotFoundError if delete affects 0 rows", async () => {
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);
      (userRepository.softDelete as jest.Mock).mockResolvedValue({ affected: 0 } as any);

      await expect(
        service.deleteUser("cid", "uid", { id: "admin" } as User)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ---------------- changeUserStatus ----------------
  describe("changeUserStatus", () => {
    it("updates status and logs activity", async () => {
      const companyId = "c";
      const userId = "u";
      const currentUser = { id: "admin" } as User;
      const statusId = "s1";
      const user = { id: userId, companyId } as User;
      const status = { id: statusId } as UserStatus;

      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);
      (userRepository.findById as jest.Mock).mockResolvedValue(user);
      (userStatusRepository.findOne as jest.Mock).mockResolvedValue(status);
      (userRepository.update as jest.Mock).mockResolvedValue({ ...user, statusId });

      const result = await service.changeUserStatus(companyId, userId, currentUser, statusId);

      expect(userRepository.update).toHaveBeenCalledWith(userId, { statusId });
      expect(userActivityLogService.log).toHaveBeenCalled();
      expect(result.statusId).toBe(statusId);
    });
  });
});
