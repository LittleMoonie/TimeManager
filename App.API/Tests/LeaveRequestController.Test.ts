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
import { LeaveType } from "../Entities/Companies/LeaveRequest";
import * as argon2 from "argon2";

describe("Leave Request Controller", () => {
  let company: Company;
  let adminUser: User;
  let employeeUser: User;
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
    const createLeaveRequestPermission = permissionRepository.create({
      name: "create_leave_request",
      companyId: company.id,
    });
    const updateLeaveRequestPermission = permissionRepository.create({
      name: "update_leave_request",
      companyId: company.id,
    });
    const deleteLeaveRequestPermission = permissionRepository.create({
      name: "delete_leave_request",
      companyId: company.id,
    });
    const createOtherLeaveRequestPermission = permissionRepository.create({
      name: "create_other_leave_request",
      companyId: company.id,
    });
    const updateOtherLeaveRequestPermission = permissionRepository.create({
      name: "update_other_leave_request",
      companyId: company.id,
    });
    const deleteOtherLeaveRequestPermission = permissionRepository.create({
      name: "delete_other_leave_request",
      companyId: company.id,
    });
    await permissionRepository.save([
      createLeaveRequestPermission,
      updateLeaveRequestPermission,
      deleteLeaveRequestPermission,
      createOtherLeaveRequestPermission,
      updateOtherLeaveRequestPermission,
      deleteOtherLeaveRequestPermission,
    ]);

    // Assign permissions to admin role
    const rolePermissionRepository =
      AppDataSource.getRepository(RolePermission);
    const adminPermissions = rolePermissionRepository.create([
      {
        roleId: adminRole.id,
        permissionId: createLeaveRequestPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: updateLeaveRequestPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: deleteLeaveRequestPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: createOtherLeaveRequestPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: updateOtherLeaveRequestPermission.id,
        companyId: company.id,
      },
      {
        roleId: adminRole.id,
        permissionId: deleteOtherLeaveRequestPermission.id,
        companyId: company.id,
      },
    ]);
    await rolePermissionRepository.save(adminPermissions);

    // Assign permissions to employee role
    const employeePermissions = rolePermissionRepository.create([
      {
        roleId: employeeRole.id,
        permissionId: createLeaveRequestPermission.id,
        companyId: company.id,
      },
      {
        roleId: employeeRole.id,
        permissionId: updateLeaveRequestPermission.id,
        companyId: company.id,
      },
      {
        roleId: employeeRole.id,
        permissionId: deleteLeaveRequestPermission.id,
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
      lastName: "LeaveTest",
      email: "admin.leavetest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: adminRole.id,
      statusId: activeStatus.id,
    });
    employeeUser = userRepository.create({
      firstName: "Employee",
      lastName: "LeaveTest",
      email: "employee.leavetest@test.com",
      passwordHash: await argon2.hash("password"),
      companyId: company.id,
      roleId: employeeRole.id,
      statusId: activeStatus.id,
    });
    await userRepository.save([adminUser, employeeUser]);

    // Authenticate users
    await request(app).post("/api/auth/login").send({
      email: "admin.leavetest@test.com",
      password: "password",
      companyId: company.id,
    });

    const authResponseEmployee = await request(app)
      .post("/api/auth/login")
      .send({
        email: "employee.leavetest@test.com",
        password: "password",
        companyId: company.id,
      });
    employeeToken = authResponseEmployee.body.token;
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("should create a new leave request", async () => {
    const newLeaveRequest = {
      userId: employeeUser.id,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      leaveType: LeaveType.PTO,
      reason: "Vacation",
    };

    const response = await request(app)
      .post("/api/leave-requests")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newLeaveRequest);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.userId).toBe(newLeaveRequest.userId);
  });

  test("should get a leave request by ID", async () => {
    const newLeaveRequest = {
      userId: employeeUser.id,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      leaveType: LeaveType.SICK,
      reason: "Flu",
    };

    const createResponse = await request(app)
      .post("/api/leave-requests")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newLeaveRequest);
    const leaveRequestId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/leave-requests/${leaveRequestId}`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(leaveRequestId);
  });

  test("should update a leave request", async () => {
    const newLeaveRequest = {
      userId: employeeUser.id,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      leaveType: LeaveType.UNPAID,
      reason: "Personal",
    };

    const createResponse = await request(app)
      .post("/api/leave-requests")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newLeaveRequest);
    const leaveRequestId = createResponse.body.id;

    const updatedReason = "Updated personal reason";
    const response = await request(app)
      .put(`/api/leave-requests/${leaveRequestId}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ reason: updatedReason });

    expect(response.statusCode).toBe(200);
    expect(response.body.reason).toBe(updatedReason);
  });

  test("should delete a leave request", async () => {
    const newLeaveRequest = {
      userId: employeeUser.id,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      leaveType: LeaveType.PTO,
      reason: "Delete me",
    };

    const createResponse = await request(app)
      .post("/api/leave-requests")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newLeaveRequest);
    const leaveRequestId = createResponse.body.id;

    const response = await request(app)
      .delete(`/api/leave-requests/${leaveRequestId}`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(response.statusCode).toBe(200);
  });
});
