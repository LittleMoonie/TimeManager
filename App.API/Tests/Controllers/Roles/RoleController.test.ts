import request from "supertest";
import { Express } from "express";
import { Container } from "typedi";
import { createTestApp } from "../../TestHelper";
import { RoleService } from "../../../Services/RoleService/RoleService";
import { UserService } from "../../../Services/User/UserService";
import { sign } from "jsonwebtoken";
import { RoleResponse } from "../../../Dtos/Users/RoleDto";
import { RolePermission } from "@Entities/Users/RolePermission";
import { Role } from "@Entities/Users/Role";

// ---- Mock the services ----
jest.mock("../../../Services/RoleService/RoleService");
jest.mock("../../../Services/User/UserService");

const generateToken = (payload: object) =>
  sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1h",
  });

describe("RoleController", () => {
  let app: Express;
  let roleService: jest.Mocked<RoleService>;
  let userService: jest.Mocked<UserService>;

  beforeAll(async () => {
    // Create the Express app once for the suite
    app = (await createTestApp()) as Express;
  });

  beforeEach(() => {
    // Fresh mocks each test
    roleService = {
      getAllRoles: jest.fn(),
      createRole: jest.fn(),
      getRoleById: jest.fn(),
      updateRole: jest.fn(),
      deleteRole: jest.fn(),
      addPermissionToRole: jest.fn(),
      removePermissionFromRole: jest.fn(),
    } as any;

    userService = {
      getUserById: jest.fn(),
    } as any;

    Container.set(RoleService, roleService);
    Container.set(UserService, userService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Container.reset();
  });

  // ---- GET /api/roles ----
  describe("GET /api/roles", () => {
    it("returns 200 OK and an array of roles for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const responseDto: RoleResponse[] = [
        { id: "role-1" } as any,
        { id: "role-2" } as any,
      ];

      roleService.getAllRoles.mockResolvedValue(responseDto as Role[]);

      const response = await request(app)
        .get("/api/roles")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(roleService.getAllRoles).toHaveBeenCalledWith(adminUser.companyId);
    });

    it("returns 403 Forbidden for non-admin users", async () => {
      const user = {
        id: "user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);

      const response = await request(app)
        .get("/api/roles")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });

  // ---- POST /api/roles ----
  describe("POST /api/roles", () => {
    it("returns 201 Created and the new role for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const createDto = { name: "New Role" };
      const responseDto: RoleResponse = { id: "role-id", ...createDto } as any;

      roleService.createRole.mockResolvedValue(responseDto as Role);

      const response = await request(app)
        .post("/api/roles")
        .set("Authorization", `Bearer ${token}`)
        .send(createDto);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(responseDto);
      expect(roleService.createRole).toHaveBeenCalledWith(
        adminUser.companyId,
        createDto
      );
    });
  });

  // ---- GET /api/roles/:id ----
  describe("GET /api/roles/:id", () => {
    it("returns 200 OK and the role data for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const roleId = "role-id";
      const responseDto: RoleResponse = { id: roleId } as any;

      roleService.getRoleById.mockResolvedValue(responseDto as Role);

      const response = await request(app)
        .get(`/api/roles/${roleId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(roleService.getRoleById).toHaveBeenCalledWith(
        adminUser.companyId,
        roleId
      );
    });
  });

  // ---- PUT /api/roles/:id ----
  describe("PUT /api/roles/:id", () => {
    it("returns 200 OK and the updated role for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const roleId = "role-id";
      const updateDto = { name: "Updated Role" };
      const responseDto: RoleResponse = { id: roleId, ...updateDto } as any;

      roleService.updateRole.mockResolvedValue(responseDto as Role);

      const response = await request(app)
        .put(`/api/roles/${roleId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(roleService.updateRole).toHaveBeenCalledWith(
        adminUser.companyId,
        roleId,
        updateDto
      );
    });
  });

  // ---- DELETE /api/roles/:id ----
  describe("DELETE /api/roles/:id", () => {
    it("returns 200 OK on successful deletion for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const roleId = "role-id";

      roleService.deleteRole.mockResolvedValue();

      const response = await request(app)
        .delete(`/api/roles/${roleId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(roleService.deleteRole).toHaveBeenCalledWith(
        adminUser.companyId,
        roleId
      );
    });
  });

  // ---- POST /api/roles/:roleId/permissions/:permissionId ----
  describe("POST /api/roles/:roleId/permissions/:permissionId", () => {
    it("returns 201 Created on successful addition for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const roleId = "role-id";
      const permissionId = "perm-id";

      const rolePermission: RolePermission = {
        id: "role-permission-id",
        companyId: adminUser.companyId,
        roleId,
        permissionId,
      } as any;

      roleService.addPermissionToRole.mockResolvedValue(rolePermission);

      const response = await request(app)
        .post(`/api/roles/${roleId}/permissions/${permissionId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(roleService.addPermissionToRole).toHaveBeenCalledWith(
        adminUser.companyId,
        roleId,
        permissionId
      );
    });
  });

  // ---- DELETE /api/roles/:roleId/permissions/:permissionId ----
  describe("DELETE /api/roles/:roleId/permissions/:permissionId", () => {
    it("returns 200 OK on successful removal for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const roleId = "role-id";
      const permissionId = "perm-id";

      roleService.removePermissionFromRole.mockResolvedValue();

      const response = await request(app)
        .delete(`/api/roles/${roleId}/permissions/${permissionId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(roleService.removePermissionFromRole).toHaveBeenCalledWith(
        adminUser.companyId,
        roleId,
        permissionId
      );
    });
  });
});
