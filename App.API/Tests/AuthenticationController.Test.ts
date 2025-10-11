import request from "supertest";
import { beforeAll, afterAll, describe, test, expect } from "@jest/globals";
import app from "../Server/index";
import { AppDataSource, connectDB } from "../Server/Database";
import User from "../Entities/Users/User";
import { Role } from "../Entities/Users/Role";
import { UserStatus } from "../Entities/Users/UserStatus";
import { Company } from "../Entities/Companies/Company";
import { Permission } from "../Entities/Users/Permission";
import { RolePermission } from "../Entities/Users/RolePermission";
import * as argon2 from "argon2";

describe("Authentication Controller", () => {
  let company: Company;
  let adminUser: User;
  let adminToken: string;
  let adminRole: Role;
  let activeStatus: UserStatus;

  beforeAll(async () => {
    await connectDB();

    // Create a company
    const companyRepository = AppDataSource.getRepository(Company);
    company = companyRepository.create({ name: "Test Company" });
    await companyRepository.save(company);

    // Create roles
    const roleRepository = AppDataSource.getRepository(Role);
    adminRole = roleRepository.create({ name: "admin", companyId: company.id });
    const employeeRole = roleRepository.create({
      name: "employee",
      companyId: company.id,
    });
    await roleRepository.save([adminRole, employeeRole]);

    // Create permissions
    const permissionRepository = AppDataSource.getRepository(Permission);
    const createUserPermission = permissionRepository.create({
      name: "create_user",
      companyId: company.id,
    });
    const createManagerPermission = permissionRepository.create({
      name: "create_manager",
      companyId: company.id,
    });
    const createAdminPermission = permissionRepository.create({
      name: "create_admin",
      companyId: company.id,
    });
    await permissionRepository.save([
      createUserPermission,
      createManagerPermission,
      createAdminPermission,
    ]);

    // Assign permissions to admin role
    const rolePermissionRepository =
      AppDataSource.getRepository(RolePermission);
    const adminPermissions = rolePermissionRepository.create([
      {
        roleId: adminRole.id,
        permissionId: createUserPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: createManagerPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: createAdminPermission.id,
        companyId: company.id,
      },
    ]);
    await rolePermissionRepository.save(adminPermissions);

    // Create user status
    const userStatusRepository = AppDataSource.getRepository(UserStatus);
    activeStatus = userStatusRepository.create({
      code: "ACTIVE",
      name: "Active",
    });
    await userStatusRepository.save(activeStatus);

    // Create admin user
    const userRepository = AppDataSource.getRepository(User);
    adminUser = userRepository.create({
      firstName: "Admin",
      lastName: "AuthTest",
      email: "admin.authtest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: adminRole.id,
      statusId: activeStatus.id,
    });
    await userRepository.save(adminUser);

    // Authenticate admin user
    const authResponseAdmin = await request(app).post("/api/auth/login").send({
      email: "admin.authtest@test.com",
      password: "password",
      companyId: company.id,
    });
    adminToken = authResponseAdmin.body.token;
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("should register a new user", async () => {
    const registerData = {
      email: "newuser@test.com",
      password: "password",
      firstName: "New",
      lastName: "User",
      companyName: "New Company",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(registerData);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toBe(registerData.email);
  });

  test("should login a user", async () => {
    const loginData = {
      email: "admin.authtest@test.com",
      password: "password",
      companyId: company.id,
    };

    const response = await request(app).post("/api/auth/login").send(loginData);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  test("should get current user", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(adminUser.id);
  });

  test("should logout a user", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
  });
});
