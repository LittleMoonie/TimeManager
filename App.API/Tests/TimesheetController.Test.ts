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
import { TimesheetStatus } from "../Entities/Timesheets/Timesheet";
import * as argon2 from "argon2";

describe("Timesheet Controller", () => {
  let company: Company;
  let adminUser: User;
  let employeeUser: User;
  let adminToken: string;
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
    const createTimesheetPermission = permissionRepository.create({
      name: "create_timesheet",
      companyId: company.id,
    });
    const getTimesheetPermission = permissionRepository.create({
      name: "get_timesheet",
      companyId: company.id,
    });
    const addTimesheetEntryPermission = permissionRepository.create({
      name: "add_timesheet_entry",
      companyId: company.id,
    });
    const submitTimesheetPermission = permissionRepository.create({
      name: "submit_timesheet",
      companyId: company.id,
    });
    const approveTimesheetPermission = permissionRepository.create({
      name: "approve_timesheet",
      companyId: company.id,
    });
    const rejectTimesheetPermission = permissionRepository.create({
      name: "reject_timesheet",
      companyId: company.id,
    });
    await permissionRepository.save([
      createTimesheetPermission,
      getTimesheetPermission,
      addTimesheetEntryPermission,
      submitTimesheetPermission,
      approveTimesheetPermission,
      rejectTimesheetPermission,
    ]);

    // Assign permissions to admin role
    const rolePermissionRepository =
      AppDataSource.getRepository(RolePermission);
    const adminPermissions = rolePermissionRepository.create([
      {
        roleId: adminRole.id,
        permissionId: createTimesheetPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: getTimesheetPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: addTimesheetEntryPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: submitTimesheetPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: approveTimesheetPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: rejectTimesheetPermission.id,
        companyId: company.id,
      },
    ]);
    await rolePermissionRepository.save(adminPermissions);

    // Assign permissions to employee role
    const employeePermissions = rolePermissionRepository.create([
      {
        roleId: employeeRole.id,
        permissionId: createTimesheetPermission.id,
        companyId: company.id,
      },
      {
        roleId: employeeRole.id,
        permissionId: getTimesheetPermission.id,
        companyId: company.id,
      },
      {
        roleId: employeeRole.id,
        permissionId: addTimesheetEntryPermission.id,
        companyId: company.id,
      },
      {
        roleId: employeeRole.id,
        permissionId: submitTimesheetPermission.id,
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
      lastName: "TimesheetTest",
      email: "admin.timesheettest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: adminRole.id,
      statusId: activeStatus.id,
    });
    employeeUser = userRepository.create({
      firstName: "Employee",
      lastName: "TimesheetTest",
      email: "employee.timesheettest@test.com",
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

    // Authenticate users
    const authResponseAdmin = await request(app).post("/api/auth/login").send({
      email: "admin.timesheettest@test.com",
      password: "password",
      companyId: company.id,
    });
    adminToken = authResponseAdmin.body.token;

    const authResponseEmployee = await request(app)
      .post("/api/auth/login")
      .send({
        email: "employee.timesheettest@test.com",
        password: "password",
        companyId: company.id,
      });
    employeeToken = authResponseEmployee.body.token;
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("should create a new timesheet", async () => {
    const newTimesheet = {
      periodStart: "2023-01-01",
      periodEnd: "2023-01-07",
    };

    const response = await request(app)
      .post("/api/timesheets")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newTimesheet);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.periodStart).toBe(newTimesheet.periodStart);
  });

  test("should get a timesheet by ID", async () => {
    const newTimesheet = {
      periodStart: "2023-01-08",
      periodEnd: "2023-01-14",
    };

    const createResponse = await request(app)
      .post("/api/timesheets")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newTimesheet);
    const timesheetId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/timesheets/${timesheetId}`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(timesheetId);
  });

  test("should add an entry to a timesheet", async () => {
    const newTimesheet = {
      periodStart: "2023-01-15",
      periodEnd: "2023-01-21",
    };

    const createTimesheetResponse = await request(app)
      .post("/api/timesheets")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newTimesheet);
    const timesheetId = createTimesheetResponse.body.id;

    const newEntry = {
      actionCodeId: regularActionCode.id,
      day: "2023-01-15",
      durationMin: 480,
    };

    const response = await request(app)
      .post(`/api/timesheets/${timesheetId}/entries`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newEntry);

    expect(response.statusCode).toBe(200);
    expect(response.body.entries).toHaveLength(1);
    expect(response.body.entries[0].durationMin).toBe(newEntry.durationMin);
  });

  test("should submit a timesheet", async () => {
    const newTimesheet = {
      periodStart: "2023-01-22",
      periodEnd: "2023-01-28",
    };

    const createTimesheetResponse = await request(app)
      .post("/api/timesheets")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newTimesheet);
    const timesheetId = createTimesheetResponse.body.id;

    const response = await request(app)
      .put(`/api/timesheets/${timesheetId}/submit`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(TimesheetStatus.SUBMITTED);
  });

  test("should approve a timesheet", async () => {
    const newTimesheet = {
      periodStart: "2023-01-29",
      periodEnd: "2023-02-04",
    };

    const createTimesheetResponse = await request(app)
      .post("/api/timesheets")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newTimesheet);
    const timesheetId = createTimesheetResponse.body.id;

    await request(app)
      .put(`/api/timesheets/${timesheetId}/submit`)
      .set("Authorization", `Bearer ${employeeToken}`);

    const response = await request(app)
      .put(`/api/timesheets/${timesheetId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(TimesheetStatus.APPROVED);
  });

  test("should reject a timesheet", async () => {
    const newTimesheet = {
      periodStart: "2023-02-05",
      periodEnd: "2023-02-11",
    };

    const createTimesheetResponse = await request(app)
      .post("/api/timesheets")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newTimesheet);
    const timesheetId = createTimesheetResponse.body.id;

    await request(app)
      .put(`/api/timesheets/${timesheetId}/submit`)
      .set("Authorization", `Bearer ${employeeToken}`);

    const response = await request(app)
      .put(`/api/timesheets/${timesheetId}/reject`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "Incorrect entries" });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(TimesheetStatus.REJECTED);
  });
});
