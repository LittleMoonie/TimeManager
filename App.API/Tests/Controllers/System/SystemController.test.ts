import request from "supertest";
import { Express } from "express";
import { createTestApp } from "../../TestHelper";
import { OpenApiService } from "../../../Services/OpenApiService";

// Mock the service
jest.mock("../../../Services/OpenApiService");

describe("SystemController", () => {
  let app: Express;

  beforeAll(async () => {
    // Create the express app once for the suite
    app = (await createTestApp()) as Express;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- GET /api/system/health ----
  describe("GET /api/system/health", () => {
    it("returns 200 OK and the system health status", async () => {
      // Arrange
      (OpenApiService.getStatus as jest.Mock).mockReturnValue({
        lastGeneratedAt: new Date(),
      });
      (OpenApiService.needsRegeneration as jest.Mock).mockResolvedValue(false);

      // Act
      const response = await request(app).get("/api/system/health");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("openapi");
    });
  });

  // ---- POST /api/system/generate-openapi ----
  describe("POST /api/system/generate-openapi", () => {
    it("returns 200 OK and a success message", async () => {
      // Arrange
      (OpenApiService.generateOpenApiSpec as jest.Mock).mockResolvedValue({
        success: true,
        message: "Generated successfully",
      });

      // Act
      const response = await request(app).post("/api/system/generate-openapi");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message", "Generated successfully");
    });
  });

  // ---- GET /api/system/openapi-status ----
  describe("GET /api/system/openapi-status", () => {
    it("returns 200 OK and the openapi status", async () => {
      // Arrange
      (OpenApiService.getStatus as jest.Mock).mockReturnValue({
        isGenerating: false,
        lastGeneratedAt: new Date(),
      });
      (OpenApiService.needsRegeneration as jest.Mock).mockResolvedValue(false);

      // Act
      const response = await request(app).get("/api/system/openapi-status");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("isGenerating", false);
      expect(response.body).toHaveProperty("needsRegeneration", false);
    });
  });
});
