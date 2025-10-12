import request from "supertest";
import { Express } from "express";
import { Container } from "typedi";
import { createTestApp } from "../../TestHelper";
import { AuthenticationService } from "@Services/AuthenticationService/AuthenticationService";
import { RegisterDto } from "@/Dtos/Authentication/RegisterDto";
import { sign } from "jsonwebtoken";
import { LoginDto } from "@/Dtos/Authentication/LoginDto";

// Mock the AuthenticationService
jest.mock("@Services/AuthenticationService/AuthenticationService");

const generateToken = (payload: object) => {
  return sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1h",
  });
};
import { AuthResponse } from "@/Dtos/Users/UserDto";

// Mock the AuthenticationService
jest.mock("@Services/AuthenticationService/AuthenticationService");

describe("AuthenticationController", () => {
  let app: Express;
  let authenticationService: jest.Mocked<AuthenticationService>;

  beforeEach(() => {
    authenticationService = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    } as any;

    Container.set(AuthenticationService, authenticationService);

    app = createTestApp() as Express;
  });

  afterEach(() => {
    jest.clearAllMocks();
    Container.reset();
  });

  describe("POST /api/auth/login", () => {
    it("should return 200 OK and an auth response on successful login", async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const authResponse: AuthResponse = {
        token: "test-token",
        user: {
          id: "test-user-id",
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
        } as any,
      };

      authenticationService.login.mockResolvedValue(authResponse);

      // Act
      const response = await request(global.testServer)
        .post("/api/auth/login")
        .send(loginDto);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(authResponse);
      expect(authenticationService.login).toHaveBeenCalledWith(
        loginDto,
        expect.any(String),
        expect.any(String),
      );
    });

    it("should return 422 Unprocessable Entity if validation fails", async () => {
      // Arrange
      const loginDto = { email: "invalid-email" }; // Missing password

      // Act
      const response = await request(global.testServer)
        .post("/api/auth/login")
        .send(loginDto);

      // Assert
      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/auth/register", () => {
    it("should return 201 Created and the new user on successful registration", async () => {
      // Arrange
      const registerDto: RegisterDto = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password123",
        companyId: "test-company-id",
        roleId: "test-role-id",
        statusId: "test-status-id",
        phoneNumber: "1234567890",
      };

      const user = {
        id: "test-user-id",
        ...registerDto,
      } as any;

      authenticationService.register.mockResolvedValue(user);

      // Act
      const response = await request(global.testServer)
        .post("/api/auth/register")
        .send(registerDto);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe(registerDto.email);
      expect(authenticationService.register).toHaveBeenCalledWith(registerDto);
    });

    it("should return 422 Unprocessable Entity if validation fails", async () => {
      // Arrange
      const registerDto = { firstName: "Test" }; // Missing fields

      // Act
      const response = await request(global.testServer)
        .post("/api/auth/register")
        .send(registerDto);

      // Assert
      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should return 200 OK on successful logout", async () => {
      // Arrange
      const token = "test-token";
      authenticationService.logout.mockResolvedValue(undefined);

      // Act
      const response = await request(global.testServer)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(authenticationService.logout).toHaveBeenCalled();
    });

    it("should return 401 Unauthorized if no token is provided", async () => {
      // Act
      const response = await request(global.testServer).post("/api/auth/logout");

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/auth/current", () => {
    it("should return 200 OK and the current user's data", async () => {
      // Arrange
      const user = {
        id: "test-user-id",
        email: "test@example.com",
        roles: ["user"],
      };
      const token = generateToken(user);

      // Act
      const response = await request(global.testServer)
        .get("/api/auth/current")
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", user.id);
      expect(response.body).toHaveProperty("email", user.email);
    });

    it("should return 401 Unauthorized if no token is provided", async () => {
      // Act
      const response = await request(global.testServer).get("/api/auth/current");

      // Assert
      expect(response.status).toBe(401);
    });
  });
});