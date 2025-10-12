import request from "supertest";
import { Express } from "express";
import { Container } from "typedi";
import { createTestApp } from "../../TestHelper";
import { PermissionService } from "../../../Services/PermissionService/PermissionService";
import { sign } from "jsonwebtoken";
import { PermissionResponse } from "../../../Dtos/Users/PermissionDto";
import { Permission } from "@Entities/Users/Permission";

// ---- Mock the service ----
jest.mock("../../../Services/PermissionService/PermissionService");

const generateToken = (payload: object) =>
  sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1h",
  });

describe("PermissionController", () => {
  let app: Express;
  let permissionService: jest.Mocked<PermissionService>;

  beforeAll(async () => {
    // Initialize test express app once
    app = (await createTestApp()) as Express;
  });

  beforeEach(() => {
    // Fresh mocks every test
    permissionService = {
      getAllPermissions: jest.fn(),
      createPermission: jest.fn(),
      getPermissionById: jest.fn(),
      updatePermission: jest.fn(),
      deletePermission: jest.fn(),
    } as any;

    // Inject into TypeDI
    Container.set(PermissionService, permissionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Container.reset();
  });

  // ---- GET /api/permissions ----
  describe("GET /api/permissions", () => {
    it("returns 200 OK and an array of permissions for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const responseDto: PermissionResponse[] = [
        { id: "perm-1" } as any,
        { id: "perm-2" } as any,
      ];

      permissionService.getAllPermissions.mockResolvedValue(responseDto as Permission[]);

      const response = await request(app)
        .get("/api/permissions")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(permissionService.getAllPermissions).toHaveBeenCalledWith(adminUser.companyId);
    });

    it("returns 403 Forbidden for non-admin users", async () => {
      const user = {
        id: "user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);

      const response = await request(app)
        .get("/api/permissions")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });

  // ---- POST /api/permissions ----
  describe("POST /api/permissions", () => {
    it("returns 201 Created and the new permission for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const createDto = { name: "new.permission" };
      const responseDto: PermissionResponse = {
        id: "perm-id",
        ...createDto,
      } as any;

      permissionService.createPermission.mockResolvedValue(responseDto as Permission);

      const response = await request(app)
        .post("/api/permissions")
        .set("Authorization", `Bearer ${token}`)
        .send(createDto);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(responseDto);
      expect(permissionService.createPermission).toHaveBeenCalledWith(
        adminUser.companyId,
        createDto
      );
    });
  });

  // ---- GET /api/permissions/:id ----
  describe("GET /api/permissions/:id", () => {
    it("returns 200 OK and the permission data for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const permissionId = "perm-id";
      const responseDto: PermissionResponse = { id: permissionId } as any;

      permissionService.getPermissionById.mockResolvedValue(responseDto as Permission);

      const response = await request(app)
        .get(`/api/permissions/${permissionId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(permissionService.getPermissionById).toHaveBeenCalledWith(
        adminUser.companyId,
        permissionId
      );
    });
  });

  // ---- PUT /api/permissions/:id ----
  describe("PUT /api/permissions/:id", () => {
    it("returns 200 OK and the updated permission for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const permissionId = "perm-id";
      const updateDto = { name: "updated.permission" };
      const responseDto: PermissionResponse = {
        id: permissionId,
        ...updateDto,
      } as any;

      permissionService.updatePermission.mockResolvedValue(responseDto as Permission);

      const response = await request(app)
        .put(`/api/permissions/${permissionId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(permissionService.updatePermission).toHaveBeenCalledWith(
        adminUser.companyId,
        permissionId,
        updateDto
      );
    });
  });

  // ---- DELETE /api/permissions/:id ----
  describe("DELETE /api/permissions/:id", () => {
    it("returns 200 OK on successful deletion for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const permissionId = "perm-id";

      permissionService.deletePermission.mockResolvedValue();

      const response = await request(app)
        .delete(`/api/permissions/${permissionId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(permissionService.deletePermission).toHaveBeenCalledWith(
        adminUser.companyId,
        permissionId
      );
    });
  });
});
