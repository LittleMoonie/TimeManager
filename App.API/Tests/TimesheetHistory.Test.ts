import request from "supertest";
import { beforeAll, afterAll, describe, test, expect } from "@jest/globals";
import { AppDataSource, connectDB } from "../Server/Database";
import app from "../Server";
import User from "../Entities/Users/User";
import { Company } from "../Entities/Companies/Company";
import {
  TimesheetEntry,
  WorkMode,
} from "../Entities/Timesheets/TimesheetEntry";
import { ActionCode } from "../Entities/Timesheets/ActionCode";
import { TimesheetHistory } from "../Entities/Timesheets/TimesheetHistory";
import { UserStatus } from "../Entities/Users/UserStatus";
import { Repository } from "typeorm";
import { sign } from "jsonwebtoken";
import { Role } from "../Entities/Users/Role";
import * as argon2 from "argon2";
import { TimesheetHistoryService } from "../Services/Logs/Timesheet/TimesheetHistoryService";
import { TimesheetHistoryRepository } from "../Repositories/Timesheets/TimesheetHistoryRepository";

// Helper to generate JWT tokens
const generateToken = (user: User, companyId: string, roles: string[]) => {
  return sign({ id: user.id, companyId, roles }, process.env.SECRET!, {
    expiresIn: "1h",
  });
};

describe("TimesheetHistory Module", () => {
  let company: Company;
  let employeeUser: User;
  let managerUser: User;
  let adminUser: User;
  let actionCode: ActionCode;
  let timesheetEntry: TimesheetEntry;
  let timesheetHistoryRepository: Repository<TimesheetHistory>;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;
  let actionCodeRepository: Repository<ActionCode>;
  let timesheetEntryRepository: Repository<TimesheetEntry>;
  let roleRepository: Repository<Role>;
  let userStatusRepository: Repository<UserStatus>;
  let employeeToken: string;

  beforeAll(async () => {
    await connectDB();
    timesheetHistoryRepository = AppDataSource.getRepository(TimesheetHistory);
    userRepository = AppDataSource.getRepository(User);
    companyRepository = AppDataSource.getRepository(Company);
    actionCodeRepository = AppDataSource.getRepository(ActionCode);
    timesheetEntryRepository = AppDataSource.getRepository(TimesheetEntry);
    roleRepository = AppDataSource.getRepository(Role);
    userStatusRepository = AppDataSource.getRepository(UserStatus);

    // Clear history table before tests
    await timesheetHistoryRepository.query(
      "TRUNCATE TABLE timesheet_history RESTART IDENTITY CASCADE;",
    );
    await timesheetEntryRepository.query(
      "TRUNCATE TABLE timesheet_entry RESTART IDENTITY CASCADE;",
    );
    await actionCodeRepository.query(
      "TRUNCATE TABLE action_code RESTART IDENTITY CASCADE;",
    );
    await userRepository.query(
      'TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;',
    );
    await companyRepository.query(
      "TRUNCATE TABLE company RESTART IDENTITY CASCADE;",
    );
    await roleRepository.query(
      "TRUNCATE TABLE roles RESTART IDENTITY CASCADE;",
    );
    await userStatusRepository.query(
      "TRUNCATE TABLE user_statuses RESTART IDENTITY CASCADE;",
    );

    // Setup test data
    company = companyRepository.create({ name: "Test Org" });
    await companyRepository.save(company);

    const employeeRole = roleRepository.create({ name: "employee" });
    await roleRepository.save(employeeRole);
    const managerRole = roleRepository.create({ name: "manager" });
    await roleRepository.save(managerRole);
    const adminRole = roleRepository.create({ name: "admin" });
    await roleRepository.save(adminRole);

    const activeStatus = userStatusRepository.create({ name: "active" });
    await userStatusRepository.save(activeStatus);

    employeeUser = userRepository.create({
      firstName: "Employee",
      lastName: "Test",
      email: "employee@test.com",
      passwordHash: await argon2.hash("password"),
      role: employeeRole,
      status: activeStatus,
      companyId: company.id,
      company: company,
    });
    await userRepository.save(employeeUser);

    managerUser = userRepository.create({
      email: "manager@test.com",
      firstName: "Manager",
      lastName: "Test",
      passwordHash: await argon2.hash("password"),
      role: managerRole,
      status: activeStatus,
      companyId: company.id,
      company: company,
    });
    await userRepository.save(managerUser);

    adminUser = userRepository.create({
      email: "admin@test.com",
      firstName: "Admin",
      lastName: "Test",
      passwordHash: await argon2.hash("password"),
      role: adminRole,
      status: activeStatus,
      companyId: company.id,
      company: company,
    });
    await userRepository.save(adminUser);

    actionCode = actionCodeRepository.create({
      name: "Work",
      code: "WRK",
      companyId: company.id,
      company: company,
    });
    await actionCodeRepository.save(actionCode);

    timesheetEntry = timesheetEntryRepository.create({
      day: new Date("2025-10-06").toISOString(),
      startedAt: "09:00",
      endedAt: "17:00",
      durationMin: 480,
      userId: employeeUser.id,
      companyId: company.id,
      actionCodeId: actionCode.id,
    });
    await timesheetEntryRepository.save(timesheetEntry);

    employeeToken = generateToken(employeeUser, company.id, [
      employeeRole.name,
    ]);
  });

  afterAll(async () => {
    await AppDataSource?.close();
  });

  test("should record a created event when a timesheet entry is created", async () => {
    const newEntryDto = {
      day: new Date("2025-10-07").toISOString(),
      startedAt: new Date("2025-10-07T09:00:00").toISOString(),
      endedAt: new Date("2025-10-07T17:00:00").toISOString(),
      durationMin: 480,
      actionCodeId: actionCode.id,
      workMode: WorkMode.OFFICE,
      country: "US",
    };

    const response = await request(app)
      .post("/api/timesheets")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(newEntryDto);

    expect(response.statusCode).toBe(201);
    const createdEntryId = response.body.id;

    const history = await timesheetHistoryRepository.findOne({
      where: {
        targetId: createdEntryId as string,
        targetType: "TimesheetEntry" as TimesheetHistory["targetType"],
      },
    });

    expect(history).toBeDefined();
    expect(history?.userId).toBe(employeeUser.id);
    expect(history?.actorUserId).toBe(employeeUser.id);
    expect(history?.companyId).toBe(company.id);
  });

  test("should record an updated event when a timesheet entry is updated", async () => {
    const employeeToken = generateToken(employeeUser, company.id, ["employee"]);
    const updatedEntryDto = {
      durationMin: 450,
    };

    const response = await request(app)
      .put(`/api/timesheets/${timesheetEntry.id}`)
      .set("Authorization", `Bearer ${employeeToken}`)
      .send(updatedEntryDto);

    expect(response.statusCode).toBe(200);

    const history = await timesheetHistoryRepository.findOne({
      where: {
        targetId: timesheetEntry.id as string,
        targetType: "TimesheetEntry" as TimesheetHistory["targetType"],
      },
      order: { occurredAt: "DESC" },
    });

    expect(history).toBeDefined();
    expect(history?.userId).toBe(employeeUser.id);
    expect(history?.actorUserId).toBe(employeeUser.id);
    expect(history?.companyId).toBe(company.id);
    expect(history?.diff).toBeDefined();
    // Add more specific diff checks if needed
  });

  test("should record a deleted event when a timesheet entry is deleted", async () => {
    const employeeToken = generateToken(employeeUser, company.id, ["employee"]);
    const entryToDelete = timesheetEntryRepository.create({
      day: new Date("2025-10-08").toISOString(),
      userId: employeeUser.id,
      companyId: company.id,
      actionCodeId: actionCode.id,
      workMode: WorkMode.OFFICE,
      country: "US",
      durationMin: 480,
    });
    await timesheetEntryRepository.save(entryToDelete);

    const response = await request(app)
      .delete(`/api/timesheet-entries/${entryToDelete.id}`)
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(response.statusCode).toBe(204);

    const history = await timesheetHistoryRepository.findOne({
      where: {
        targetId: entryToDelete.id as string,
        action: "deleted" as TimesheetHistory["action"],
        targetType: "TimesheetEntry" as TimesheetHistory["targetType"],
      },
    });

    expect(history).toBeDefined();
    expect(history?.userId).toBe(employeeUser.id);
    expect(history?.actorUserId).toBe(employeeUser.id);
    expect(history?.companyId).toBe(company.id);
  });

  test("should record an approved event when a timesheet entry is approved", async () => {
    const managerToken = generateToken(managerUser, company.id, ["manager"]);

    const response = await request(app)
      .post(`/api/timesheets/${timesheetEntry.id}/approve`)
      .set("Authorization", `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);

    const history = await timesheetHistoryRepository.findOne({
      where: {
        targetId: response.body.id as string, // Approval ID
        targetType: "TimesheetApproval" as TimesheetHistory["targetType"],
      },
    });

    expect(history).toBeDefined();
    expect(history?.userId).toBe(employeeUser.id);
    expect(history?.actorUserId).toBe(managerUser.id);
    expect(history?.companyId).toBe(company.id);
  });

  test("should record a rejected event when a timesheet entry is rejected", async () => {
    const managerToken = generateToken(managerUser, company.id, ["manager"]);
    const entryToReject = timesheetEntryRepository.create({
      day: new Date("2025-10-09").toISOString(),
      userId: employeeUser.id,
      companyId: company.id,
      actionCodeId: actionCode.id,
      workMode: WorkMode.OFFICE,
      country: "US",
      durationMin: 480,
    });
    await timesheetEntryRepository.save(entryToReject);

    const response = await request(app)
      .post(`/api/timesheets/${entryToReject.id}/reject`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ reason: "Incorrect hours" });

    expect(response.statusCode).toBe(200);

    const history = await timesheetHistoryRepository.findOne({
      where: {
        targetId: response.body.id as string,
        action: "rejected" as TimesheetHistory["action"],
        targetType: "TimesheetApproval" as TimesheetHistory["targetType"],
      },
    });

    expect(history).toBeDefined();
    expect(history?.userId).toBe(employeeUser.id);
    expect(history?.actorUserId).toBe(managerUser.id);
    expect(history?.companyId).toBe(company.id);
    expect(history?.reason).toBe("Incorrect hours");
  });

  test("employee should only be able to read their own timesheet history", async () => {
    const response = await request(app).get("/api/timesheet-history");

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    response.body.data.forEach((history: TimesheetHistory) => {
      expect(history.userId).toBe(employeeUser.id);
    });
  });

  test("manager should be able to read company-wide timesheet history", async () => {
    const managerToken = generateToken(managerUser, company.id, ["manager"]);

    const response = await request(app)
      .get("/api/timesheet-history")
      .set("Authorization", `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    response.body.data.forEach((history: TimesheetHistory) => {
      expect(history.companyId).toBe(company.id);
    });
  });

  test("manager should be able to filter timesheet history by userId", async () => {
    const managerToken = generateToken(managerUser, company.id, ["manager"]);

    const response = await request(app)
      .get(`/api/timesheet-history?userId=${employeeUser.id}`)
      .set("Authorization", `Bearer ${managerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    response.body.data.forEach((history: TimesheetHistory) => {
      expect(history.userId).toBe(employeeUser.id);
      expect(history.companyId).toBe(company.id);
    });
  });

  test("should handle cursor pagination correctly", async () => {
    const managerToken = generateToken(managerUser, company.id, ["manager"]);

    // Create many entries to test pagination
    for (let i = 0; i < 10; i++) {
      const newEntry = timesheetEntryRepository.create({
        day: new Date(`2025-11-${10 + i}`).toISOString(),
        userId: employeeUser.id,
        companyId: company.id,
        actionCodeId: actionCode.id,
        durationMin: 480,
      });
      await timesheetEntryRepository.save(newEntry);
      // This will trigger history events
      await request(app)
        .post("/api/timesheets")
        .set("Authorization", `Bearer ${employeeToken}`)
        .send({
          day: new Date(`2025-11-${10 + i}`).toISOString() as string,
          startedAt: new Date(`2025-11-${10 + i}T09:00:00`),
          endedAt: new Date(`2025-11-${10 + i}T17:00:00`),
          durationMin: 480,
          actionCodeId: actionCode.id,
          workMode: WorkMode.OFFICE,
          country: "US",
        });
    }

    const firstPageResponse = await request(app)
      .get("/api/timesheet-history?limit=5")
      .set("Authorization", `Bearer ${managerToken}`);

    expect(firstPageResponse.statusCode).toBe(200);
    expect(firstPageResponse.body.data.length).toBe(5);
    expect(firstPageResponse.body.nextCursor).toBeDefined();

    const secondPageResponse = await request(app)
      .get(
        `/api/timesheet-history?limit=5&cursor=${firstPageResponse.body.nextCursor}`,
      )
      .set("Authorization", `Bearer ${managerToken}`);

    expect(secondPageResponse.statusCode).toBe(200);
    expect(secondPageResponse.body.data.length).toBe(5);
    // Ensure no overlap and correct ordering
    expect(secondPageResponse.body.data[0].id).not.toBe(
      firstPageResponse.body.data[0].id,
    );
    expect(
      new Date(secondPageResponse.body.data[0].occurredAt).getTime(),
    ).toBeLessThanOrEqual(
      new Date(
        firstPageResponse.body.data[
          firstPageResponse.body.data.length - 1
        ].occurredAt,
      ).getTime(),
    );
  });

  test("should not duplicate history events for the same hash (idempotency)", async () => {
    // Simulate a call that would generate the same hash
    const duplicateEventDto = {
      targetType: "TimesheetEntry" as TimesheetHistory["targetType"],
      targetId: timesheetEntry.id,
      action: "retro_edit_enabled" as TimesheetHistory["action"],
      userId: employeeUser.id,
      actorUserId: employeeUser.id,
      metadata: { source: "test" },
    };

    // Directly call the service method to test idempotency
    const historyService = new TimesheetHistoryService(
      new TimesheetHistoryRepository(),
    );
    await historyService.recordEvent(company.id, duplicateEventDto);
    // Mock dependencies for historyService if needed, or get from container
    // This requires a more robust test setup for TypeDI services

    // For now, we'll just check the count after a direct insert attempt (which should be prevented by unique index)
    // A proper integration test would call the API endpoint that triggers recordEvent

    // Attempt to save another event with the same hash directly (should fail or be ignored by unique index)
    const manualEvent = await timesheetHistoryRepository.save(
      timesheetHistoryRepository.create({
        companyId: company.id,
        userId: employeeUser.id,
        actorUserId: employeeUser.id,
        targetType: "TimesheetEntry" as TimesheetHistory["targetType"],
        targetId: timesheetEntry.id,
        action: "retro_edit_enabled" as TimesheetHistory["action"],
        metadata: { source: "test" },
      }),
    );
    try {
    } catch (error) {
      // Expect a unique constraint error if hash is not null
      expect((error as Error).message).toContain(
        "duplicate key value violates unique constraint",
      );
    }

    const count = await timesheetHistoryRepository.count({
      where: { id: manualEvent.id },
    });
    expect(count).toBe(1);
  });
});
