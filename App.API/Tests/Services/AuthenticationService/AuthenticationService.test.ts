import { AuthenticationService } from "../../../Services/AuthenticationService/AuthenticationService";
import { UserRepository } from "../../../Repositories/Users/UserRepository";
import { CompanyRepository } from "../../../Repositories/Companies/CompanyRepository";
import { RoleRepository } from "../../../Repositories/Users/RoleRepository";
import { UserStatusRepository } from "../../../Repositories/Users/UserStatusRepository";
import ActiveSession from "../../../Entities/Users/ActiveSessions";
import { ObjectLiteral, Repository } from "typeorm";
import { AuthenticationError, NotFoundError } from "../../../Errors/HttpErrors";
import User from "../../../Entities/Users/User";

import * as bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

// ---- Mocks ----
jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => "mock-hash"),
  compare: jest.fn(() => true),
}));
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mock-token"),
}));

// ---- Utility to create lightweight mock repos ----
function createMockRepository<T>(): jest.Mocked<Partial<Repository<T & ObjectLiteral>>> {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
}

describe("AuthenticationService", () => {
  let service: AuthenticationService;
  let userRepository: jest.Mocked<Partial<UserRepository>>;
  let companyRepository: jest.Mocked<Partial<CompanyRepository>>;
  let roleRepository: jest.Mocked<Partial<RoleRepository>>;
  let userStatusRepository: jest.Mocked<Partial<UserStatusRepository>>;
  let activeSessionRepository: jest.Mocked<Partial<Repository<ActiveSession>>>;

  beforeEach(() => {
    userRepository = createMockRepository<User>() as any;
    companyRepository = createMockRepository<any>() as any;
    roleRepository = createMockRepository<any>() as any;
    userStatusRepository = createMockRepository<any>() as any;
    activeSessionRepository = createMockRepository<ActiveSession>() as any;

    // ✅ Include the ActiveSession repository in the constructor if your service expects it
    service = new AuthenticationService(
      userRepository as any,
      companyRepository as any,
      roleRepository as any,
      userStatusRepository as any
    );

    jest.clearAllMocks();
  });

  // ---- LOGIN ----
  describe("login", () => {
    it("returns a token and user data on successful login", async () => {
      const loginDto = { email: "test@example.com", password: "password123" };
      const user = {
        id: "test-user-id",
        email: "test@example.com",
        passwordHash: "hashed-password",
      } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (sign as jest.Mock).mockReturnValue("test-token");

      const result = await service.login(loginDto, "127.0.0.1", "test-agent");

      expect(result.token).toBe("test-token");
      expect(result.user).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(sign).toHaveBeenCalled();
    });

    it("throws AuthenticationError for invalid password", async () => {
      const loginDto = { email: "test@example.com", password: "wrong-password" };
      const user = {
        id: "test-user-id",
        email: "test@example.com",
        passwordHash: "hashed-password",
      } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login(loginDto, "127.0.0.1", "test-agent")
      ).rejects.toThrow(AuthenticationError);
    });

    it("throws NotFoundError for non-existent user", async () => {
      const loginDto = { email: "not-found@example.com", password: "password123" };
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login(loginDto, "127.0.0.1", "test-agent")
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ---- REGISTER ----
  describe("register", () => {
    it("creates a new user and company on successful registration", async () => {
      const registerDto = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password123",
        companyName: "Test Company",
        companyId: "company-id",
        roleId: "role-id",
        statusId: "status-id",
        phoneNumber: "1234567890",
      };

      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      (roleRepository.findOne as jest.Mock).mockResolvedValue({ id: "role-id" });
      (userStatusRepository.findOne as jest.Mock).mockResolvedValue({ id: "status-id" });
      (userRepository.create as jest.Mock).mockImplementation((u) => u);
      (userRepository.save as jest.Mock).mockResolvedValue({
        id: "test-user-id",
        ...registerDto,
      });
      (companyRepository.create as jest.Mock).mockImplementation((c) => c);
      (companyRepository.save as jest.Mock).mockResolvedValue({
        id: "test-company-id",
        name: registerDto.companyName,
      });

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.id).toBe("test-user-id");
      expect(userRepository.save).toHaveBeenCalled();
      expect(companyRepository.save).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });
  });

  // ---- LOGOUT ----
  describe("logout", () => {
    it("deletes the active session on logout", async () => {
      const userId = "test-user-id";
      (activeSessionRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.logout(userId);

      expect(activeSessionRepository.delete).toHaveBeenCalledWith({ userId });
    });
  });
});
