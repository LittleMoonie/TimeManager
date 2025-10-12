import request from "supertest";
import { Express } from "express";
import { Container } from "typedi";
import { createTestApp } from "../../TestHelper";
import { CompanySettingsService } from "../../../Services/Company/CompanySettingsService";
import { UserService } from "../../../Services/User/UserService";
import { sign } from "jsonwebtoken";
import { CompanySettingsResponseDto } from "../../../Dtos/Company/CompanySettingsDto";
import { CompanySettings } from "@Entities/Companies/CompanySettings";

// ---- Mock dependencies ----
jest.mock("../../../Services/Company/CompanySettingsService");
jest.mock("../../../Services/User/UserService");

// ---- Helper: JWT generator ----
const generateToken = (payload: object) =>
  sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1h",
  });

describe("CompanySettingsController", () => {
  let app: Express;
  let companySettingsService: jest.Mocked<CompanySettingsService>;
  let userService: jest.Mocked<UserService>;

  beforeAll(async () => {
    // Spin up a fresh express app for this suite
    app = (await createTestApp()) as Express;
  });

  beforeEach(() => {
    // Create mocks
    companySettingsService = {
      getCompanySettings: jest.fn(),
      updateCompanySettings: jest.fn(),
    } as any;

    userService = {
      getUserById: jest.fn(),
    } as any;

    // Inject mocks into TypeDI container
    Container.set(CompanySettingsService, companySettingsService);
    Container.set(UserService, userService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Container.reset();
  });

  // ---- GET /api/company-settings ----
  describe("GET /api/company-settings", () => {
    it("returns 200 OK and the company settings", async () => {
      const user = {
        id: "test-user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);

      const companySettingsResponse: CompanySettingsResponseDto = {
        companyId: user.companyId,
        timezone: "UTC",
      } as any;

      companySettingsService.getCompanySettings.mockResolvedValue(
        companySettingsResponse as CompanySettings
      );

      const response = await request(app)
        .get("/api/company-settings")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(companySettingsResponse);
      expect(companySettingsService.getCompanySettings).toHaveBeenCalledWith(
        user.companyId
      );
    });

    it("returns 401 Unauthorized if no token provided", async () => {
      const response = await request(app).get("/api/company-settings");
      expect(response.status).toBe(401);
    });
  });

  // ---- PUT /api/company-settings ----
  describe("PUT /api/company-settings", () => {
    it("returns 200 OK and updated settings for admin users", async () => {
      const updateDto = { timezone: "PST" };
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);

      const companySettingsResponse: CompanySettingsResponseDto = {
        companyId: adminUser.companyId,
        ...updateDto,
      } as any;

      userService.getUserById.mockResolvedValue(adminUser as any);
      companySettingsService.updateCompanySettings.mockResolvedValue(
        companySettingsResponse as CompanySettings
      );

      const response = await request(app)
        .put("/api/company-settings")
        .set("Authorization", `Bearer ${token}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(companySettingsResponse);
      expect(companySettingsService.updateCompanySettings).toHaveBeenCalledWith(
        adminUser,
        adminUser.companyId,
        updateDto
      );
    });

    it("returns 403 Forbidden for non-admin users", async () => {
      const updateDto = { timezone: "PST" };
      const user = {
        id: "user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);

      const response = await request(app)
        .put("/api/company-settings")
        .set("Authorization", `Bearer ${token}`)
        .send(updateDto);

      expect(response.status).toBe(403);
    });
  });
});
