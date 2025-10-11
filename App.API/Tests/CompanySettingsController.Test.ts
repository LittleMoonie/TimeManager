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
import { CompanySettings } from "../Entities/Companies/CompanySettings";
import * as argon2 from "argon2";

describe("Company Settings Controller", () => {
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

    // Create company settings
    const companySettingsRepository =
      AppDataSource.getRepository(CompanySettings);
    const companySettings = companySettingsRepository.create({
      companyId: company.id,
    });
    await companySettingsRepository.save(companySettings);

    // Create roles
    const roleRepository = AppDataSource.getRepository(Role);
    adminRole = roleRepository.create({ name: "admin", companyId: company.id });
    await roleRepository.save(adminRole);

    // Create permissions
    const permissionRepository = AppDataSource.getRepository(Permission);
    const updateCompanySettingsPermission = permissionRepository.create({
      name: "update_company_settings",
      companyId: company.id,
    });
    await permissionRepository.save(updateCompanySettingsPermission);

    // Assign permissions to admin role
    const rolePermissionRepository =
      AppDataSource.getRepository(RolePermission);
    const adminPermissions = rolePermissionRepository.create([
      {
        roleId: adminRole.id,
        permissionId: updateCompanySettingsPermission.id,
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
      lastName: "CompanySettingsTest",
      email: "admin.companysettingstest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: adminRole.id,
      statusId: activeStatus.id,
    });
    await userRepository.save(adminUser);

    // Authenticate admin user
    const authResponseAdmin = await request(app).post("/api/auth/login").send({
      email: "admin.companysettingstest@test.com",
      password: "password",
      companyId: company.id,
    });
    adminToken = authResponseAdmin.body.token;
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("should get company settings", async () => {
    const response = await request(app)
      .get("/api/company-settings")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("companyId");
  });

  test("should update company settings", async () => {
    const updatedTimezone = "America/New_York";
    const response = await request(app)
      .put("/api/company-settings")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ timezone: updatedTimezone });

    expect(response.statusCode).toBe(200);
    expect(response.body.timezone).toBe(updatedTimezone);
  });
});
