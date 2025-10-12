import request from "supertest";
import { Express } from "express";
import { Container } from "typedi";
import { createTestApp } from "../../TestHelper";
import { TimesheetService } from "../../../Services/Timesheet/TimesheetService";
import { sign } from "jsonwebtoken";
import { Timesheet } from "../../../Entities/Timesheets/Timesheet";
import {
  CreateTimesheetDto,
  CreateTimesheetEntryDto,
} from "../../../Dtos/Timesheet/TimesheetDto";

// Mock the service
jest.mock("../../../Services/Timesheet/TimesheetService");

const generateToken = (payload: object) =>
  sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1h",
  });

describe("TimesheetController", () => {
  let app: Express;
  let timesheetService: jest.Mocked<TimesheetService>;

  beforeAll(async () => {
    app = (await createTestApp()) as Express;
  });

  beforeEach(() => {
    timesheetService = {
      createTimesheet: jest.fn(),
      getTimesheet: jest.fn(),
      addTimesheetEntry: jest.fn(),
      submitTimesheet: jest.fn(),
      approveTimesheet: jest.fn(),
      rejectTimesheet: jest.fn(),
    } as any;

    Container.set(TimesheetService, timesheetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Container.reset();
  });

  // ---- POST /api/timesheets ----
  describe("POST /api/timesheets", () => {
    it("returns 200 OK and the created timesheet", async () => {
      const user = { id: "test-user-id", companyId: "test-company-id", roles: ["user"] };
      const createDto: CreateTimesheetDto = {
        periodStart: new Date().toISOString(),
        periodEnd: new Date().toISOString(),
      };
      const responseDto: Timesheet = { id: "ts-id", ...createDto } as any;

      timesheetService.createTimesheet.mockResolvedValue(responseDto);

      const token = generateToken(user);
      const response = await request(app)
        .post("/api/timesheets")
        .set("Authorization", `Bearer ${token}`)
        .send(createDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(timesheetService.createTimesheet).toHaveBeenCalledWith(
        user.companyId,
        user.id,
        createDto
      );
    });

    it("returns 401 Unauthorized if no token is provided", async () => {
      const createDto: CreateTimesheetDto = {
        periodStart: new Date().toISOString(),
        periodEnd: new Date().toISOString(),
      };
      const response = await request(app).post("/api/timesheets").send(createDto);
      expect(response.status).toBe(401);
    });
  });

  // ---- GET /api/timesheets/:id ----
  describe("GET /api/timesheets/:id", () => {
    it("returns 200 OK and the timesheet data", async () => {
      const user = { id: "test-user-id", companyId: "test-company-id", roles: ["user"] };
      const token = generateToken(user);
      const timesheetId = "ts-id";
      const responseDto: Timesheet = { id: timesheetId } as any;

      timesheetService.getTimesheet.mockResolvedValue(responseDto);

      const response = await request(app)
        .get(`/api/timesheets/${timesheetId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(timesheetService.getTimesheet).toHaveBeenCalledWith(
        user.companyId,
        timesheetId
      );
    });

    it("returns 401 Unauthorized if no token is provided", async () => {
      const response = await request(app).get("/api/timesheets/some-id");
      expect(response.status).toBe(401);
    });
  });

  // ---- POST /api/timesheets/:id/entries ----
  describe("POST /api/timesheets/:id/entries", () => {
    it("returns 200 OK and the updated timesheet with new entry", async () => {
      const user = { id: "test-user-id", companyId: "test-company-id", roles: ["user"] };
      const token = generateToken(user);
      const timesheetId = "ts-id";
      const createEntryDto: CreateTimesheetEntryDto = {
        actionCodeId: "ac-id",
        day: new Date().toISOString(),
        durationMin: 60,
      };
      const responseDto: Timesheet = { id: timesheetId, totalMinutes: 60 } as any;

      timesheetService.addTimesheetEntry.mockResolvedValue(responseDto);

      const response = await request(app)
        .post(`/api/timesheets/${timesheetId}/entries`)
        .set("Authorization", `Bearer ${token}`)
        .send(createEntryDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(timesheetService.addTimesheetEntry).toHaveBeenCalledWith(
        user.companyId,
        timesheetId,
        createEntryDto
      );
    });
  });

  // ---- PUT /api/timesheets/:id/submit ----
  describe("PUT /api/timesheets/:id/submit", () => {
    it("returns 200 OK and the submitted timesheet", async () => {
      const user = { id: "test-user-id", companyId: "test-company-id", roles: ["user"] };
      const token = generateToken(user);
      const timesheetId = "ts-id";
      const responseDto: Timesheet = { id: timesheetId, status: "submitted" } as any;

      timesheetService.submitTimesheet.mockResolvedValue(responseDto);

      const response = await request(app)
        .put(`/api/timesheets/${timesheetId}/submit`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(timesheetService.submitTimesheet).toHaveBeenCalledWith(
        user.companyId,
        timesheetId,
        user.id
      );
    });
  });

  // ---- PUT /api/timesheets/:id/approve ----
  describe("PUT /api/timesheets/:id/approve", () => {
    it("returns 200 OK and the approved timesheet for admin/manager users", async () => {
      const adminUser = { id: "admin-user-id", companyId: "test-company-id", roles: ["admin"] };
      const token = generateToken(adminUser);
      const timesheetId = "ts-id";
      const responseDto: Timesheet = { id: timesheetId, status: "approved" } as any;

      timesheetService.approveTimesheet.mockResolvedValue(responseDto);

      const response = await request(app)
        .put(`/api/timesheets/${timesheetId}/approve`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(timesheetService.approveTimesheet).toHaveBeenCalledWith(
        adminUser.companyId,
        timesheetId,
        adminUser.id
      );
    });

    it("returns 403 Forbidden for non-admin/manager users", async () => {
      const user = { id: "user-id", companyId: "test-company-id", roles: ["user"] };
      const token = generateToken(user);
      const timesheetId = "ts-id";

      const response = await request(app)
        .put(`/api/timesheets/${timesheetId}/approve`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });

  // ---- PUT /api/timesheets/:id/reject ----
  describe("PUT /api/timesheets/:id/reject", () => {
    it("returns 200 OK and the rejected timesheet for admin/manager users", async () => {
      const adminUser = { id: "admin-user-id", companyId: "test-company-id", roles: ["admin"] };
      const token = generateToken(adminUser);
      const timesheetId = "ts-id";
      const reason = "Incorrect entries";
      const responseDto: Timesheet = { id: timesheetId, status: "rejected" } as any;

      timesheetService.rejectTimesheet.mockResolvedValue(responseDto);

      const response = await request(app)
        .put(`/api/timesheets/${timesheetId}/reject`)
        .set("Authorization", `Bearer ${token}`)
        .send({ reason });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(timesheetService.rejectTimesheet).toHaveBeenCalledWith(
        adminUser.companyId,
        timesheetId,
        reason,
        adminUser.id
      );
    });

    it("returns 403 Forbidden for non-admin/manager users", async () => {
      const user = { id: "user-id", companyId: "test-company-id", roles: ["user"] };
      const token = generateToken(user);
      const timesheetId = "ts-id";
      const reason = "Incorrect entries";

      const response = await request(app)
        .put(`/api/timesheets/${timesheetId}/reject`)
        .set("Authorization", `Bearer ${token}`)
        .send({ reason });

      expect(response.status).toBe(403);
    });
  });
});
