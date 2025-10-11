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

describe("Permission Controller", () => {
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
    const createPermissionPermission = permissionRepository.create({
      name: "create_permission",
      companyId: company.id,
    });
    const updatePermissionPermission = permissionRepository.create({
      name: "update_permission",
      companyId: company.id,
    });
    const deletePermissionPermission = permissionRepository.create({
      name: "delete_permission",
      companyId: company.id,
    });
    await permissionRepository.save([
      createPermissionPermission,
      updatePermissionPermission,
      deletePermissionPermission,
    ]);

    // Assign permissions to admin role
    const rolePermissionRepository =
      AppDataSource.getRepository(RolePermission);
    const adminPermissions = rolePermissionRepository.create([
      {
        roleId: adminRole.id,
        permissionId: createPermissionPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: updatePermissionPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: deletePermissionPermission.id,
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
      lastName: "PermissionTest",
      email: "admin.permissiontest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: adminRole.id,
      statusId: activeStatus.id,
    });
    await userRepository.save(adminUser);

    // Authenticate admin user
    const authResponseAdmin = await request(app).post("/api/auth/login").send({
      email: "admin.permissiontest@test.com",
      password: "password",
      companyId: company.id,
    });
    adminToken = authResponseAdmin.body.token;
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("should create a new permission", async () => {
    const newPermission = {
      name: "test:new_permission",
      description: "A new permission for testing",
    };

    const response = await request(app)
      .post("/api/permissions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newPermission);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(newPermission.name);
  });

  test("should get a permission by ID", async () => {
    const createResponse = await request(app)
      .post("/api/permissions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "test:another_permission",
        description: "Another permission for testing",
      });
    const permissionId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/permissions/${permissionId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(permissionId);
  });

  test("should update a permission", async () => {
    const createResponse = await request(app)
      .post("/api/permissions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "test:permission_to_update",
        description: "Permission to be updated",
      });
    const permissionId = createResponse.body.id;

    const updatedDescription = "Updated permission description";
    const response = await request(app)
      .put(`/api/permissions/${permissionId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "test:permission_to_update",
        description: updatedDescription,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.description).toBe(updatedDescription);
  });

  test("should delete a permission", async () => {
    const createResponse = await request(app)
      .post("/api/permissions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "test:permission_to_delete",
        description: "Permission to be deleted",
      });
    const permissionId = createResponse.body.id;

    const response = await request(app)
      .delete(`/api/permissions/${permissionId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Permission deleted successfully");
  });
});
