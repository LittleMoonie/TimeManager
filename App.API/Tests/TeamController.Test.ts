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

describe("Team Controller", () => {
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
    const createTeamPermission = permissionRepository.create({
      name: "create_team",
      companyId: company.id,
    });
    const updateTeamPermission = permissionRepository.create({
      name: "update_team",
      companyId: company.id,
    });
    const deleteTeamPermission = permissionRepository.create({
      name: "delete_team",
      companyId: company.id,
    });
    await permissionRepository.save([
      createTeamPermission,
      updateTeamPermission,
      deleteTeamPermission,
    ]);

    // Assign permissions to admin role
    const rolePermissionRepository =
      AppDataSource.getRepository(RolePermission);
    const adminPermissions = rolePermissionRepository.create([
      {
        roleId: adminRole.id,
        permissionId: createTeamPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: updateTeamPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: deleteTeamPermission.id,
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
      lastName: "TeamTest",
      email: "admin.teamtest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: adminRole.id,
      statusId: activeStatus.id,
    });
    await userRepository.save(adminUser);

    // Authenticate admin user
    const authResponseAdmin = await request(app).post("/api/auth/login").send({
      email: "admin.teamtest@test.com",
      password: "password",
      companyId: company.id,
    });
    adminToken = authResponseAdmin.body.token;
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("should create a new team", async () => {
    const newTeam = {
      name: "Test Team",
    };

    const response = await request(app)
      .post("/api/teams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newTeam);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(newTeam.name);
  });

  test("should get a team by ID", async () => {
    const createResponse = await request(app)
      .post("/api/teams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Another Team" });
    const teamId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/teams/${teamId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(teamId);
  });

  test("should update a team", async () => {
    const createResponse = await request(app)
      .post("/api/teams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Team to Update" });
    const teamId = createResponse.body.id;

    const updatedName = "Updated Team Name";
    const response = await request(app)
      .put(`/api/teams/${teamId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: updatedName });

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe(updatedName);
  });

  test("should delete a team", async () => {
    const createResponse = await request(app)
      .post("/api/teams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Team to Delete" });
    const teamId = createResponse.body.id;

    const response = await request(app)
      .delete(`/api/teams/${teamId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Team deleted successfully");
  });
});
