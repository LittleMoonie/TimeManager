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

describe("User Controller", () => {
  let company: Company;
  let adminUser: User;
  let employeeUser: User;
  let adminToken: string;
  let adminRole: Role;
  let employeeRole: Role;
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
    employeeRole = roleRepository.create({
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

    // Create users
    const userRepository = AppDataSource.getRepository(User);
    adminUser = userRepository.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: adminRole.id,
      statusId: activeStatus.id,
    });
    employeeUser = userRepository.create({
      firstName: "Employee",
      lastName: "User",
      email: "employee@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: employeeRole.id,
      statusId: activeStatus.id,
    });
    await userRepository.save([adminUser, employeeUser]);

    // Authenticate users
    const authResponseAdmin = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "password",
      companyId: company.id,
    });
    adminToken = authResponseAdmin.body.token;
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("should create a new user", async () => {
    const newUser = {
      firstName: "New",
      lastName: "User",
      email: "newuser@test.com",
      password: "password",
      roleId: employeeRole.id,
      statusId: activeStatus.id,
    };

    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newUser);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toBe(newUser.email);
  });

  test("should get a user by ID", async () => {
    const response = await request(app)
      .get(`/api/users/${adminUser.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(adminUser.id);
  });

  test("should update a user", async () => {
    const updatedName = "UpdatedAdmin";
    const response = await request(app)
      .put(`/api/users/${adminUser.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ firstName: updatedName });

    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe(updatedName);
  });

  test("should delete a user", async () => {
    const newUserToDelete = {
      firstName: "Delete",
      lastName: "Me",
      email: "deleteme@test.com",
      password: "password",
      roleId: employeeRole.id,
      statusId: activeStatus.id,
    };

    const createResponse = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newUserToDelete);

    const userIdToDelete = createResponse.body.id;

    const deleteResponse = await request(app)
      .delete(`/api/users/${userIdToDelete}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.message).toBe("User deleted successfully");
  });
});
