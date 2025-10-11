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

describe("Company Controller", () => {
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
    const createCompanyPermission = permissionRepository.create({
      name: "create_company",
      companyId: company.id,
    });
    const updateCompanyPermission = permissionRepository.create({
      name: "update_company",
      companyId: company.id,
    });
    await permissionRepository.save([
      createCompanyPermission,
      updateCompanyPermission,
    ]);

    // Assign permissions to admin role
    const rolePermissionRepository =
      AppDataSource.getRepository(RolePermission);
    const adminPermissions = rolePermissionRepository.create([
      {
        roleId: adminRole.id,
        permissionId: createCompanyPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: updateCompanyPermission.id,
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
      lastName: "CompanyTest",
      email: "admin.companytest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: adminRole.id,
      statusId: activeStatus.id,
    });
    await userRepository.save(adminUser);

    // Authenticate admin user
    const authResponseAdmin = await request(app).post("/api/auth/login").send({
      email: "admin.companytest@test.com",
      password: "password",
      companyId: company.id,
    });
    adminToken = authResponseAdmin.body.token;
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("should create a new company", async () => {
    const newCompany = {
      name: "New Test Company",
    };

    const response = await request(app)
      .post("/api/companies")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newCompany);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(newCompany.name);
  });

  test("should get a company by ID", async () => {
    const createResponse = await request(app)
      .post("/api/companies")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Another Test Company" });
    const companyId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/companies/${companyId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(companyId);
  });

  test("should update a company", async () => {
    const createResponse = await request(app)
      .post("/api/companies")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Company to Update" });
    const companyId = createResponse.body.id;

    const updatedName = "Updated Company Name";
    const response = await request(app)
      .put(`/api/companies/${companyId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: updatedName });

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe(updatedName);
  });
});
