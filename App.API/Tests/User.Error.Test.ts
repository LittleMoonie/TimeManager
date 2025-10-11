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

describe("User Controller Error Scenarios", () => {
  let company: Company;
  let adminUser: User;
  let employeeUser: User;
  let adminToken: string;
  let employeeToken: string;
  let noCreateToken: string;
  let userCreatorToken: string;
  let managerRole: Role;
  let adminRole: Role;
  let employeeRole: Role;
  let userCreatorRole: Role;
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
    managerRole = roleRepository.create({
      name: "manager",
      companyId: company.id,
    });
    userCreatorRole = roleRepository.create({
      name: "user_creator",
      companyId: company.id,
    });
    await roleRepository.save([
      adminRole,
      employeeRole,
      managerRole,
      userCreatorRole,
    ]);

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

    // Assign permissions to roles
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
    const userCreatorPermissions = rolePermissionRepository.create([
      {
        roleId: userCreatorRole.id,
        permissionId: createUserPermission.id,
        companyId: company.id,
      },
    ]);
    await rolePermissionRepository.save([
      ...adminPermissions,
      ...userCreatorPermissions,
    ]);

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
    const noCreateUser = userRepository.create({
      firstName: "NoCreate",
      lastName: "User",
      email: "nocreate@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: userCreatorRole.id,
      statusId: activeStatus.id,
    });
    const userCreator = userRepository.create({
      firstName: "UserCreator",
      lastName: "User",
      email: "usercreator@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: userCreatorRole.id,
      statusId: activeStatus.id,
    });
    await userRepository.save([
      adminUser,
      employeeUser,
      noCreateUser,
      userCreator,
    ]);

    // Authenticate users
    const authResponseAdmin = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "password",
      companyId: company.id,
    });
    adminToken = authResponseAdmin.body.token;

    const authResponseEmployee = await request(app)
      .post("/api/auth/login")
      .send({
        email: "employee@test.com",
        password: "password",
        companyId: company.id,
      });
    employeeToken = authResponseEmployee.body.token;

    const authResponseNoCreate = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nocreate@test.com",
        password: "password",
        companyId: company.id,
      });
    noCreateToken = authResponseNoCreate.body.token;

    const authResponseUserCreator = await request(app)
      .post("/api/auth/login")
      .send({
        email: "usercreator@test.com",
        password: "password",
        companyId: company.id,
      });
    userCreatorToken = authResponseUserCreator.body.token;
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("Getting a non-existent user should return 404", async () => {
    const nonExistentUserId = "f47ac10b-58cc-4372-a567-0e02b2c3d479"; // Random UUID
    const response = await request(app)
      .get(`/api/users/${nonExistentUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  test("Employee getting another user profile should return 403", async () => {
    const response = await request(app)
      .get(`/api/users/${adminUser.id}`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Forbidden: Employees can only view their own profile",
    );
  });

  test("Creating a user without create_user permission should return 403", async () => {
    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${noCreateToken}`)
      .send({
        firstName: "Test",
        lastName: "User",
        email: "testuser@test.com",
        password: "password",
        roleId: employeeRole.id,
        statusId: activeStatus.id,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "User does not have permission to create users.",
    );
  });

  test("Creating a manager without create_manager permission should return 403", async () => {
    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${userCreatorToken}`)
      .send({
        firstName: "Test",
        lastName: "Manager",
        password: "password",
        roleId: managerRole.id,
        statusId: activeStatus.id,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "User does not have permission to create managers.",
    );
  });

  test("Creating an admin without create_admin permission should return 403", async () => {
    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${userCreatorToken}`)
      .send({
        firstName: "Test",
        lastName: "Admin",
        email: "testadmin@test.com",
        password: "password",
        roleId: adminRole.id,
        statusId: activeStatus.id,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "User does not have permission to create admins.",
    );
  });
});
