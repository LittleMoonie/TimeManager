import request from "supertest";
import { Express } from "express";
import { Container } from "typedi";
import { createTestApp } from "../../TestHelper";
import { ActionCodeService } from "../../../Services/Timesheet/ActionCodeService";
import { sign } from "jsonwebtoken";
import { ActionCode } from "../../../Entities/Timesheets/ActionCode";

// ---- Mock the service ----
jest.mock("../../../Services/Timesheet/ActionCodeService");

const generateToken = (payload: object) =>
  sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1h",
  });

describe("ActionCodeController", () => {
  let app: Express;
  let actionCodeService: jest.Mocked<ActionCodeService>;

  beforeAll(async () => {
    // Create app once per suite
    app = (await createTestApp()) as Express;
  });

  beforeEach(() => {
    actionCodeService = {
      search: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    Container.set(ActionCodeService, actionCodeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Container.reset();
  });

  // ---- GET /api/action-codes ----
  describe("GET /api/action-codes", () => {
    it("returns 200 OK and an array of action codes", async () => {
      const user = {
        id: "test-user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);
      const responseDto: ActionCode[] = [
        { id: "ac-1" } as any,
        { id: "ac-2" } as any,
      ];

      actionCodeService.search.mockResolvedValue(responseDto);

      const response = await request(app)
        .get("/api/action-codes")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(actionCodeService.search).toHaveBeenCalledWith(user.companyId);
    });

    it("returns 401 Unauthorized if no token is provided", async () => {
      const response = await request(app).get("/api/action-codes");
      expect(response.status).toBe(401);
    });
  });

  // ---- POST /api/action-codes ----
  describe("POST /api/action-codes", () => {
    it("returns 200 OK and the created action code for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const createDto = { code: "NEW", name: "New Action" };
      const responseDto: ActionCode = { id: "ac-id", ...createDto } as any;

      actionCodeService.create.mockResolvedValue(responseDto);

      const response = await request(app)
        .post("/api/action-codes")
        .set("Authorization", `Bearer ${token}`)
        .send(createDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(actionCodeService.create).toHaveBeenCalledWith(
        adminUser.companyId,
        createDto
      );
    });

    it("returns 403 Forbidden for non-admin/manager users", async () => {
      const user = {
        id: "user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);
      const createDto = { code: "NEW", name: "New Action" };

      const response = await request(app)
        .post("/api/action-codes")
        .set("Authorization", `Bearer ${token}`)
        .send(createDto);

      expect(response.status).toBe(403);
    });
  });

  // ---- PUT /api/action-codes/:id ----
  describe("PUT /api/action-codes/:id", () => {
    it("returns 200 OK and the updated action code for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const actionCodeId = "ac-id";
      const updateDto = { name: "Updated Action" };
      const responseDto: ActionCode = { id: actionCodeId, ...updateDto } as any;

      actionCodeService.update.mockResolvedValue(responseDto);

      const response = await request(app)
        .put(`/api/action-codes/${actionCodeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(actionCodeService.update).toHaveBeenCalledWith(
        adminUser.companyId,
        actionCodeId,
        updateDto
      );
    });

    it("returns 403 Forbidden for non-admin/manager users", async () => {
      const user = {
        id: "user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);
      const actionCodeId = "ac-id";
      const updateDto = { name: "Updated Action" };

      const response = await request(app)
        .put(`/api/action-codes/${actionCodeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateDto);

      expect(response.status).toBe(403);
    });
  });

  // ---- DELETE /api/action-codes/:id ----
  describe("DELETE /api/action-codes/:id", () => {
    it("returns 200 OK on successful deletion for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const actionCodeId = "ac-id";

      actionCodeService.delete.mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/action-codes/${actionCodeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(actionCodeService.delete).toHaveBeenCalledWith(
        adminUser.companyId,
        actionCodeId
      );
    });

    it("returns 403 Forbidden for non-admin/manager users", async () => {
      const user = {
        id: "user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);
      const actionCodeId = "ac-id";

      const response = await request(app)
        .delete(`/api/action-codes/${actionCodeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });
});
