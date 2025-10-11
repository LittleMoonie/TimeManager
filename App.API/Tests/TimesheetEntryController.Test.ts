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
import { ActionCode, ActionCodeType } from "../Entities/Timesheets/ActionCode";
import * as argon2 from "argon2";

describe("Timesheet Entry Controller", () => {
  let company: Company;
  let adminUser: User;
  let employeeUser: User;
  let employeeToken: string;
  let adminRole: Role;
  let employeeRole: Role;
  let activeStatus: UserStatus;
  let regularActionCode: ActionCode;

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
    const createTimesheetEntryPermission = permissionRepository.create({
      name: "create_timesheet_entry",
      companyId: company.id,
    });
    const updateTimesheetEntryPermission = permissionRepository.create({
      name: "update_timesheet_entry",
      companyId: company.id,
    });
    const deleteTimesheetEntryPermission = permissionRepository.create({
      name: "delete_timesheet_entry",
      companyId: company.id,
    });
    await permissionRepository.save([
      createTimesheetEntryPermission,
      updateTimesheetEntryPermission,
      deleteTimesheetEntryPermission,
    ]);

    // Assign permissions to admin role
    const rolePermissionRepository =
      AppDataSource.getRepository(RolePermission);
    const adminPermissions = rolePermissionRepository.create([
      {
        roleId: adminRole.id,
        permissionId: createTimesheetEntryPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: updateTimesheetEntryPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: deleteTimesheetEntryPermission.id,
        companyId: company.id,
      },
    ]);
    await rolePermissionRepository.save(adminPermissions);

    // Assign permissions to employee role
    const employeePermissions = rolePermissionRepository.create([
      {
        roleId: employeeRole.id,
        permissionId: createTimesheetEntryPermission.id,
        companyId: company.id,
      },
      {
        roleId: employeeRole.id,
        permissionId: updateTimesheetEntryPermission.id,
        companyId: company.id,
      },
      {
        roleId: employeeRole.id,
        permissionId: deleteTimesheetEntryPermission.id,
        companyId: company.id,
      },
    ]);
    await rolePermissionRepository.save(employeePermissions);

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
      lastName: "TimesheetEntryTest",
      email: "admin.timesheetentrytest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: adminRole.id,
      statusId: activeStatus.id,
    });
    employeeUser = userRepository.create({
      firstName: "Employee",
      lastName: "TimesheetEntryTest",
      email: "employee.timesheetentrytest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: employeeRole.id,
      statusId: activeStatus.id,
    });
    await userRepository.save([adminUser, employeeUser]);

    // Create action code
    const actionCodeRepository = AppDataSource.getRepository(ActionCode);
    regularActionCode = actionCodeRepository.create({
      code: "REGULAR",
      name: "Regular Work",
      type: ActionCodeType.BILLABLE,
      companyId: company.id,
    });
    await actionCodeRepository.save(regularActionCode);

    // Create a timesheet
    await request(app)
      .post("/api/timesheets")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ periodStart: "2023-04-01", periodEnd: "2023-04-07" });

    // Authenticate users
    await request(app).post("/api/auth/login").send({
      email: "admin.timesheetentrytest@test.com",
      password: "password",
      companyId: company.id,
    });

    const authResponseEmployee = await request(app)
      .post("/api/auth/login")
      .send({
        email: "employee.timesheetentrytest@test.com",
        password: "password",
        companyId: company.id,
      });
    employeeToken = authResponseEmployee.body.token;
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("should create a new timesheet entry", async () => {
    const newEntry = {
      actionCodeId: regularActionCode.id,
      day: "2023-04-01",
      durationMin: 480,
    };

    const response = await request(app)
      .post("/api/timesheet-entries")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newEntry);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.durationMin).toBe(newEntry.durationMin);
  });

  test("should get a timesheet entry by ID", async () => {
    const newEntry = {
      actionCodeId: regularActionCode.id,
      day: "2023-04-02",
      durationMin: 240,
    };

    const createResponse = await request(app)
      .post("/api/timesheet-entries")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newEntry);
    const entryId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/timesheet-entries/${entryId}`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(entryId);
  });

  test("should update a timesheet entry", async () => {
    const newEntry = {
      actionCodeId: regularActionCode.id,
      day: "2023-04-03",
      durationMin: 120,
    };

    const createResponse = await request(app)
      .post("/api/timesheet-entries")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newEntry);
    const entryId = createResponse.body.id;

    const updatedDuration = 360;
    const response = await request(app)
      .put(`/api/timesheet-entries/${entryId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ durationMin: updatedDuration });

    expect(response.statusCode).toBe(200);
    expect(response.body.durationMin).toBe(updatedDuration);
  });

  test("should delete a timesheet entry", async () => {
    const newEntry = {
      actionCodeId: regularActionCode.id,
      day: "2023-04-04",
      durationMin: 60,
    };

    const createResponse = await request(app)
      .post("/api/timesheet-entries")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newEntry);
    const entryId = createResponse.body.id;

    const response = await request(app)
      .delete(`/api/timesheet-entries/${entryId}`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(response.statusCode).toBe(200);
  });
});
