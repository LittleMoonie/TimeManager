import request from "supertest";
import { Express } from "express";
import { Container } from "typedi";
import { createTestApp } from "../TestHelper";
import { AnonymizationService } from "../../Services/AnonymizationService";
import { sign } from "jsonwebtoken";

// ---- Mock the service ----
jest.mock("../../Services/AnonymizationService");

const generateToken = (payload: object) =>
  sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1h",
  });

describe("AnonymizationController", () => {
  let app: Express;
  let anonymizationService: jest.Mocked<AnonymizationService>;

  beforeAll(async () => {
    app = (await createTestApp()) as Express;
  });

  beforeEach(() => {
    anonymizationService = {
      anonymizeUserData: jest.fn(),
    } as any;

    Container.set(AnonymizationService, anonymizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Container.reset();
  });

  // ---- DELETE /api/anonymization/:userId ----
  describe("DELETE /api/anonymization/:userId", () => {
    it("returns 204 No Content and calls anonymizeUserData for admin users", async () => {
      const userId = "test-user-id";
      const adminToken = generateToken({
        id: "admin-id",
        companyId: "test-company-id",
        roles: ["admin"],
      });

      anonymizationService.anonymizeUserData.mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/anonymization/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
      expect(anonymizationService.anonymizeUserData).toHaveBeenCalledWith(userId);
    });

    it("returns 401 Unauthorized if no token is provided", async () => {
      const userId = "test-user-id";

      const response = await request(app).delete(`/api/anonymization/${userId}`);

      expect(response.status).toBe(401);
    });

    it("returns 403 Forbidden if the user is not an admin", async () => {
      const userId = "test-user-id";
      const userToken = generateToken({
        id: "normal-user-id",
        companyId: "test-company-id",
        roles: ["user"],
      });

      const response = await request(app)
        .delete(`/api/anonymization/${userId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});
