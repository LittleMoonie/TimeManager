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
import { TimesheetStatus } from "../Entities/Timesheets/Timesheet";
import * as argon2 from "argon2";

describe("Timesheet Approval Controller", () => {
  let company: Company;
  let adminUser: User;
  let employeeUser: User;
  let adminToken: string;
  let employeeToken: string;
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
    const createTimesheetApprovalPermission = permissionRepository.create({
      name: "create_timesheet_approval",
      companyId: company.id,
    });
    const updateTimesheetApprovalPermission = permissionRepository.create({
      name: "update_timesheet_approval",
      companyId: company.id,
    });
    const deleteTimesheetApprovalPermission = permissionRepository.create({
      name: "delete_timesheet_approval",
      companyId: company.id,
    });
    await permissionRepository.save([
      createTimesheetApprovalPermission,
      updateTimesheetApprovalPermission,
      deleteTimesheetApprovalPermission,
    ]);

    // Assign permissions to admin role
    const rolePermissionRepository =
      AppDataSource.getRepository(RolePermission);
    const adminPermissions = rolePermissionRepository.create([
      {
        roleId: adminRole.id,
        permissionId: createTimesheetApprovalPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: updateTimesheetApprovalPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: deleteTimesheetApprovalPermission.id,
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
      lastName: "TimesheetApprovalTest",
      email: "admin.timesheetapprovaltest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: adminRole.id,
      statusId: activeStatus.id,
    });
    employeeUser = userRepository.create({
      firstName: "Employee",
      lastName: "TimesheetApprovalTest",
      email: "employee.timesheetapprovaltest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: employeeRole.id,
      statusId: activeStatus.id,
    });
    await userRepository.save([adminUser, employeeUser]);

    // Authenticate users
    const authResponseAdmin = await request(app).post("/api/auth/login").send({
      email: "admin.timesheetapprovaltest@test.com",
      password: "password",
      companyId: company.id,
    });
    adminToken = authResponseAdmin.body.token;

    const authResponseEmployee = await request(app)
      .post("/api/auth/login")
      .send({
        email: "employee.timesheetapprovaltest@test.com",
        password: "password",
        companyId: company.id,
      });
    employeeToken = authResponseEmployee.body.token;
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("should create a new timesheet approval", async () => {
    // First, create a timesheet to approve
    const createTimesheetResponse = await request(app)
      .post("/api/timesheets")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ periodStart: "2023-03-01", periodEnd: "2023-03-07" });
    const timesheetId = createTimesheetResponse.body.id;

    // Submit the timesheet
    await request(app)
      .put(`/api/timesheets/${timesheetId}/submit`)
      .set("Authorization", `Bearer ${employeeToken}`);

    const newTimesheetApproval = {
      timesheetId: timesheetId,
      approverId: adminUser.id,
    };

    const response = await request(app)
      .post("/api/timesheet-approvals")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newTimesheetApproval);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.timesheetId).toBe(newTimesheetApproval.timesheetId);
  });

  test("should get a timesheet approval by ID", async () => {
    // First, create a timesheet to approve
    const createTimesheetResponse = await request(app)
      .post("/api/timesheets")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ periodStart: "2023-03-08", periodEnd: "2023-03-14" });
    const timesheetId = createTimesheetResponse.body.id;

    // Submit the timesheet
    await request(app)
      .put(`/api/timesheets/${timesheetId}/submit`)
      .set("Authorization", `Bearer ${employeeToken}`);

    const createApprovalResponse = await request(app)
      .post("/api/timesheet-approvals")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ timesheetId: timesheetId, approverId: adminUser.id });
    const approvalId = createApprovalResponse.body.id;

    const response = await request(app)
      .get(`/api/timesheet-approvals/${approvalId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(approvalId);
  });

  test("should update a timesheet approval", async () => {
    // First, create a timesheet to approve
    const createTimesheetResponse = await request(app)
      .post("/api/timesheets")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ periodStart: "2023-03-15", periodEnd: "2023-03-21" });
    const timesheetId = createTimesheetResponse.body.id;

    // Submit the timesheet
    await request(app)
      .put(`/api/timesheets/${timesheetId}/submit`)
      .set("Authorization", `Bearer ${employeeToken}`);

    const createApprovalResponse = await request(app)
      .post("/api/timesheet-approvals")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ timesheetId: timesheetId, approverId: adminUser.id });
    const approvalId = createApprovalResponse.body.id;

    const updatedStatus = TimesheetStatus.APPROVED;
    const response = await request(app)
      .put(`/api/timesheet-approvals/${approvalId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: updatedStatus });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(updatedStatus);
  });

  test("should delete a timesheet approval", async () => {
    // First, create a timesheet to approve
    const createTimesheetResponse = await request(app)
      .post("/api/timesheets")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ periodStart: "2023-03-22", periodEnd: "2023-03-28" });
    const timesheetId = createTimesheetResponse.body.id;

    // Submit the timesheet
    await request(app)
      .put(`/api/timesheets/${timesheetId}/submit`)
      .set("Authorization", `Bearer ${employeeToken}`);

    const createApprovalResponse = await request(app)
      .post("/api/timesheet-approvals")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ timesheetId: timesheetId, approverId: adminUser.id });
    const approvalId = createApprovalResponse.body.id;

    const response = await request(app)
      .delete(`/api/timesheet-approvals/${approvalId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
  });
});
