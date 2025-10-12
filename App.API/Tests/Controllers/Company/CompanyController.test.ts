import request from "supertest";
import express, { Express } from "express";
import { Container } from "typedi";
import { CompanyService } from "../../../Services/Company/CompanyService";
import { UserService } from "../../../Services/User/UserService";
import { sign } from "jsonwebtoken";
import { CompanyResponseDto } from "../../../Dtos/Company/CompanyDto";
import { createTestApp } from "../../TestHelper"; // should return an Express app
import { Company } from "@Entities/Companies/Company";

// ---- Mock the services ----
jest.mock("../../../Services/Company/CompanyService");
jest.mock("../../../Services/User/UserService");

// ---- Helper for generating tokens ----
const generateToken = (payload: object) => {
  return sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1h",
  });
};

describe("CompanyController", () => {
  let app: Express;
  let companyService: jest.Mocked<CompanyService>;
  let userService: jest.Mocked<UserService>;

  beforeAll(async () => {
    // Create a clean express app instance for these tests
    app = (await createTestApp()) as Express;
  });

  beforeEach(() => {
    // New mocks each test
    companyService = {
      getCompanyById: jest.fn(),
      createCompany: jest.fn(),
      updateCompany: jest.fn(),
    } as any;

    userService = {
      getUserById: jest.fn(),
    } as any;

    // Inject mocks into TypeDI
    Container.set(CompanyService, companyService);
    Container.set(UserService, userService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Container.reset();
  });

  // ---- GET /api/companies/:id ----
  describe("GET /api/companies/:id", () => {
    it("should return 200 OK and the company data", async () => {
      const companyId = "test-company-id";
      const user = {
        id: "test-user-id",
        companyId,
        roles: ["user"],
      };
      const token = generateToken(user);

      const companyResponse: CompanyResponseDto = {
        id: companyId,
        name: "Test Company",
      } as any;

      companyService.getCompanyById.mockResolvedValue(companyResponse as Company);

      const response = await request(app)
        .get(`/api/companies/${companyId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(companyResponse);
      expect(companyService.getCompanyById).toHaveBeenCalledWith(
        expect.any(Object),
        companyId
      );
    });

    it("should return 401 if no token provided", async () => {
      const companyId = "test-company-id";
      const response = await request(app).get(`/api/companies/${companyId}`);
      expect(response.status).toBe(401);
    });
  });

  // ---- POST /api/companies ----
  describe("POST /api/companies", () => {
    it("should return 201 Created for admin users", async () => {
      const createCompanyDto = { name: "New Company" };
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);

      const companyResponse: CompanyResponseDto = {
        id: "new-company-id",
        ...createCompanyDto,
      } as any;

      userService.getUserById.mockResolvedValue(adminUser as any);
      companyService.createCompany.mockResolvedValue(companyResponse as Company);

      const response = await request(app)
        .post("/api/companies")
        .set("Authorization", `Bearer ${token}`)
        .send(createCompanyDto);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(companyResponse);
      expect(companyService.createCompany).toHaveBeenCalledWith(
        adminUser,
        createCompanyDto
      );
    });

    it("should return 403 Forbidden for non-admin users", async () => {
      const createCompanyDto = { name: "New Company" };
      const user = {
        id: "user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);

      const response = await request(app)
        .post("/api/companies")
        .set("Authorization", `Bearer ${token}`)
        .send(createCompanyDto);

      expect(response.status).toBe(403);
    });
  });

  // ---- PUT /api/companies/:id ----
  describe("PUT /api/companies/:id", () => {
    it("should return 200 OK for admin users", async () => {
      const companyId = "test-company-id";
      const updateCompanyDto = { name: "Updated Company" };
      const adminUser = {
        id: "admin-user-id",
        companyId,
        roles: ["admin"],
      };
      const token = generateToken(adminUser);

      const companyResponse: CompanyResponseDto = {
        id: companyId,
        ...updateCompanyDto,
      } as any;

      userService.getUserById.mockResolvedValue(adminUser as any);
      companyService.updateCompany.mockResolvedValue(companyResponse as Company);

      const response = await request(app)
        .put(`/api/companies/${companyId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateCompanyDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(companyResponse);
      expect(companyService.updateCompany).toHaveBeenCalledWith(
        adminUser,
        companyId,
        updateCompanyDto
      );
    });

    it("should return 403 Forbidden for non-admin users", async () => {
      const companyId = "test-company-id";
      const updateCompanyDto = { name: "Updated Company" };
      const user = { id: "user-id", companyId, roles: ["user"] };
      const token = generateToken(user);

      const response = await request(app)
        .put(`/api/companies/${companyId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateCompanyDto);

      expect(response.status).toBe(403);
    });
  });
});
