import request from "supertest";
import { Express } from "express";
import { Container } from "typedi";
import { createTestApp } from "../../TestHelper";
import { UserService } from "../../../Services/User/UserService";
import { RolePermissionService } from "../../../Services/RoleService/RolePermissionService";
import { sign } from "jsonwebtoken";
import { UserDto } from "../../../Dtos/Users/UserDto";
import { CreateUserDto } from "../../../Dtos/Users/CreateUserDto";
import { UpdateUserDto } from "../../../Dtos/Users/UpdateUserDto";

// ---- Mock the services ----
jest.mock("../../../Services/User/UserService");
jest.mock("../../../Services/User/RolePermissionService");

const generateToken = (payload: object) =>
  sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1h",
  });

describe("UserController", () => {
  let app: Express;
  let userService: jest.Mocked<UserService>;
  let rolePermissionService: jest.Mocked<RolePermissionService>;

  beforeAll(async () => {
    app = (await createTestApp()) as Express;
  });

  beforeEach(() => {
    userService = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    } as any;

    rolePermissionService = {
      checkPermission: jest.fn(),
    } as any;

    Container.set(UserService, userService);
    Container.set(RolePermissionService, rolePermissionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Container.reset();
  });

  // ---- GET /api/users ----
  describe("GET /api/users", () => {
    it("returns 200 OK and an array of users", async () => {
      const user = { id: "test-user-id", companyId: "test-company-id", roles: ["user"] };
      const token = generateToken(user);
      const responseDto: UserDto[] = [
        { id: "user-1" } as any,
        { id: "user-2" } as any,
      ];

      userService.getAllUsers.mockResolvedValue(responseDto as any);

      const response = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(userService.getAllUsers).toHaveBeenCalledWith(user.companyId);
    });

    it("returns 401 Unauthorized if no token is provided", async () => {
      const response = await request(app).get("/api/users");
      expect(response.status).toBe(401);
    });
  });

  // ---- GET /api/users/:id ----
  describe("GET /api/users/:id", () => {
    it("returns 200 OK and the user data", async () => {
      const user = { id: "test-user-id", companyId: "test-company-id", roles: ["user"] };
      const token = generateToken(user);
      const userId = "user-id";
      const responseDto: UserDto = { id: userId } as any;

      userService.getUserById.mockResolvedValue(responseDto as any);

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(userService.getUserById).toHaveBeenCalledWith(user.companyId, userId);
    });

    it("returns 401 Unauthorized if no token is provided", async () => {
      const response = await request(app).get("/api/users/some-id");
      expect(response.status).toBe(401);
    });
  });

  // ---- POST /api/users ----
  describe("POST /api/users", () => {
    it("returns 200 OK and the created user for admin users", async () => {
      const adminUser = { id: "admin-user-id", companyId: "test-company-id", roles: ["admin"] };
      const token = generateToken(adminUser);
      const createDto: CreateUserDto = {
        firstName: "New",
        lastName: "User",
        email: "new@example.com",
        password: "password123",
        roleId: "role-id",
      };
      const responseDto: UserDto = { id: "new-user-id", ...createDto } as any;

      rolePermissionService.checkPermission.mockResolvedValue(true);
      userService.createUser.mockResolvedValue(responseDto as any);

      const response = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send(createDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(userService.createUser).toHaveBeenCalledWith(adminUser.companyId, createDto);
    });

    it("returns 403 Forbidden for non-admin users", async () => {
      const user = { id: "user-id", companyId: "test-company-id", roles: ["user"] };
      const token = generateToken(user);
      const createDto: CreateUserDto = {
        firstName: "New",
        lastName: "User",
        email: "new@example.com",
        password: "password123",
        roleId: "role-id",
      };

      rolePermissionService.checkPermission.mockResolvedValue(false);

      const response = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send(createDto);

      expect(response.status).toBe(403);
    });
  });

  // ---- PUT /api/users/:id ----
  describe("PUT /api/users/:id", () => {
    it("returns 200 OK and the updated user for admin users", async () => {
      const adminUser = { id: "admin-user-id", companyId: "test-company-id", roles: ["admin"] };
      const token = generateToken(adminUser);
      const userId = "user-id";
      const updateDto: UpdateUserDto = { firstName: "Updated" };
      const responseDto: UserDto = { id: userId, ...updateDto } as any;

      rolePermissionService.checkPermission.mockResolvedValue(true);
      userService.updateUser.mockResolvedValue(responseDto as any);

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(userService.updateUser).toHaveBeenCalledWith(
        adminUser.companyId,
        userId,
        updateDto
      );
    });

    it("returns 403 Forbidden for non-admin users", async () => {
      const user = { id: "user-id", companyId: "test-company-id", roles: ["user"] };
      const token = generateToken(user);
      const userId = "user-id";
      const updateDto: UpdateUserDto = { firstName: "Updated" };

      rolePermissionService.checkPermission.mockResolvedValue(false);

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateDto);

      expect(response.status).toBe(403);
    });
  });

  // ---- DELETE /api/users/:id ----
  describe("DELETE /api/users/:id", () => {
    it("returns 200 OK on successful deletion for admin users", async () => {
      const adminUser = { id: "admin-user-id", companyId: "test-company-id", roles: ["admin"] };
      const token = generateToken(adminUser);
      const userId = "user-id";

      rolePermissionService.checkPermission.mockResolvedValue(true);
      userService.deleteUser.mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(userService.deleteUser).toHaveBeenCalledWith(adminUser.companyId, userId);
    });

    it("returns 403 Forbidden for non-admin users", async () => {
      const user = { id: "user-id", companyId: "test-company-id", roles: ["user"] };
      const token = generateToken(user);
      const userId = "user-id";

      rolePermissionService.checkPermission.mockResolvedValue(false);

      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });
});
