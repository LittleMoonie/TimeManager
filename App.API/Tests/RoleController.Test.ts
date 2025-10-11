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

describe("Role Controller", () => {
  let company: Company;
  let adminUser: User;
  let adminToken: string;
  let adminRole: Role;
  let activeStatus: UserStatus;
  let readUsersPermission: Permission;

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
    readUsersPermission = permissionRepository.create({
      name: "users:read",
      companyId: company.id,
    });
    const createRolePermission = permissionRepository.create({
      name: "create_role",
      companyId: company.id,
    });
    const updateRolePermission = permissionRepository.create({
      name: "update_role",
      companyId: company.id,
    });
    const deleteRolePermission = permissionRepository.create({
      name: "delete_role",
      companyId: company.id,
    });
    const addPermissionToRolePermission = permissionRepository.create({
      name: "add_permission_to_role",
      companyId: company.id,
    });
    const removePermissionFromRolePermission = permissionRepository.create({
      name: "remove_permission_from_role",
      companyId: company.id,
    });
    await permissionRepository.save([
      readUsersPermission,
      createRolePermission,
      updateRolePermission,
      deleteRolePermission,
      addPermissionToRolePermission,
      removePermissionFromRolePermission,
    ]);

    // Assign permissions to admin role
    const rolePermissionRepository =
      AppDataSource.getRepository(RolePermission);
    const adminPermissions = rolePermissionRepository.create([
      {
        roleId: adminRole.id,
        permissionId: readUsersPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: createRolePermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: updateRolePermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: deleteRolePermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: addPermissionToRolePermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: removePermissionFromRolePermission.id,
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
      lastName: "RoleTest",
      email: "admin.roletest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: adminRole.id,
      statusId: activeStatus.id,
    });
    await userRepository.save(adminUser);

    // Authenticate admin user
    const authResponseAdmin = await request(app).post("/api/auth/login").send({
      email: "admin.roletest@test.com",
      password: "password",
      companyId: company.id,
    });
    adminToken = authResponseAdmin.body.token;
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("should create a new role", async () => {
    const newRole = {
      name: "Test Role",
      description: "A role for testing",
    };

    const response = await request(app)
      .post("/api/roles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newRole);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(newRole.name);
  });

  test("should get a role by ID", async () => {
    const createResponse = await request(app)
      .post("/api/roles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Another Role", description: "Another role for testing" });
    const roleId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/roles/${roleId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(roleId);
  });

  test("should update a role", async () => {
    const createResponse = await request(app)
      .post("/api/roles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Role to Update", description: "Role to be updated" });
    const roleId = createResponse.body.id;

    const updatedDescription = "Updated description";
    const response = await request(app)
      .put(`/api/roles/${roleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Role to Update", description: updatedDescription });

    expect(response.statusCode).toBe(200);
    expect(response.body.description).toBe(updatedDescription);
  });

  test("should add permission to a role", async () => {
    const createRoleResponse = await request(app)
      .post("/api/roles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Role for Perms", description: "Role for permissions" });
    const roleId = createRoleResponse.body.id;

    const response = await request(app)
      .post(`/api/roles/${roleId}/permissions/${readUsersPermission.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Permission added to role successfully");
  });

  test("should remove permission from a role", async () => {
    const createRoleResponse = await request(app)
      .post("/api/roles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Role to Remove Perm",
        description: "Role to remove permissions",
      });
    const roleId = createRoleResponse.body.id;

    await request(app)
      .post(`/api/roles/${roleId}/permissions/${readUsersPermission.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    const response = await request(app)
      .delete(`/api/roles/${roleId}/permissions/${readUsersPermission.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "Permission removed from role successfully",
    );
  });

  test("should delete a role", async () => {
    const createResponse = await request(app)
      .post("/api/roles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Role to Delete", description: "Role to be deleted" });
    const roleId = createResponse.body.id;

    const response = await request(app)
      .delete(`/api/roles/${roleId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Role deleted successfully");
  });
});
