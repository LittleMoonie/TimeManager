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

describe("Action Code Controller", () => {
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
    await roleRepository.save(adminRole);

    // Create permissions
    const permissionRepository = AppDataSource.getRepository(Permission);
    const createActionCodePermission = permissionRepository.create({
      name: "create_action_code",
      companyId: company.id,
    });
    const updateActionCodePermission = permissionRepository.create({
      name: "update_action_code",
      companyId: company.id,
    });
    const deleteActionCodePermission = permissionRepository.create({
      name: "delete_action_code",
      companyId: company.id,
    });
    await permissionRepository.save([
      createActionCodePermission,
      updateActionCodePermission,
      deleteActionCodePermission,
    ]);

    // Assign permissions to admin role
    const rolePermissionRepository =
      AppDataSource.getRepository(RolePermission);
    const adminPermissions = rolePermissionRepository.create([
      {
        roleId: adminRole.id,
        permissionId: createActionCodePermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: updateActionCodePermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: deleteActionCodePermission.id,
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
      lastName: "ActionCodeTest",
      email: "admin.actioncodetest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: adminRole.id,
      statusId: activeStatus.id,
    });
    await userRepository.save(adminUser);

    // Authenticate admin user
    const authResponseAdmin = await request(app).post("/api/auth/login").send({
      email: "admin.actioncodetest@test.com",
      password: "password",
      companyId: company.id,
    });
    adminToken = authResponseAdmin.body.token;
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("should create a new action code", async () => {
    const newActionCode = {
      name: "Test Action Code",
      code: "TAC",
    };

    const response = await request(app)
      .post("/api/action-codes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newActionCode);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(newActionCode.name);
  });

  test("should get all action codes", async () => {
    const response = await request(app)
      .get("/api/action-codes")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test("should update an action code", async () => {
    const createResponse = await request(app)
      .post("/api/action-codes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Action Code to Update", code: "ACU" });
    const actionCodeId = createResponse.body.id;

    const updatedName = "Updated Action Code Name";
    const response = await request(app)
      .put(`/api/action-codes/${actionCodeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: updatedName, code: "ACU" });

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe(updatedName);
  });

  test("should delete an action code", async () => {
    const createResponse = await request(app)
      .post("/api/action-codes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Action Code to Delete", code: "ACD" });
    const actionCodeId = createResponse.body.id;

    const response = await request(app)
      .delete(`/api/action-codes/${actionCodeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
  });
});
