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

const generateToken = (payload: object) => {
  return sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1h",
  });
};

describe("TimesheetController", () => {
  let app: Express;
  let timesheetService: jest.Mocked<TimesheetService>;

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

    app = createTestApp() as Express;
  });

  afterEach(() => {
    jest.clearAllMocks();
    Container.reset();
  });

  describe("POST /api/timesheets", () => {
    it("should return 200 OK and the created timesheet", async () => {
      // Arrange
      const user = {
        id: "test-user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const createDto: CreateTimesheetDto = { periodStart: new Date().toISOString(), periodEnd: new Date().toISOString() };
      const responseDto: Timesheet = { id: "ts-id", ...createDto } as any;

      timesheetService.createTimesheet.mockResolvedValue(responseDto);

      const token = generateToken(user);
      // Act
      const response = await request(global.testServer)
        .post("/api/timesheets")
        .set("Authorization", `Bearer ${token}`)
        .send(createDto);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
    });

    it("should return 401 Unauthorized if no token is provided", async () => {
      // Arrange
      const createDto: CreateTimesheetDto = {
        periodStart: new Date().toISOString(),
        periodEnd: new Date().toISOString(),
      };

      // Act
      const response = await request(global.testServer)
        .post("/api/timesheets")
        .send(createDto);

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/timesheets/{id}", () => {
    it("should return 200 OK and the timesheet data", async () => {
      // Arrange
      const user = {
        id: "test-user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);
      const timesheetId = "ts-id";
      const responseDto: Timesheet = { id: timesheetId } as any;

      timesheetService.getTimesheet.mockResolvedValue(responseDto);

      // Act
      const response = await request(global.testServer)
        .get(`/api/timesheets/${timesheetId}`)
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
    });

    it("should return 401 Unauthorized if no token is provided", async () => {
      // Act
      const response = await request(global.testServer).get("/api/timesheets/some-id");

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/timesheets/{id}/entries", () => {
    it("should return 200 OK and the updated timesheet with new entry", async () => {
      // Arrange
      const user = {
        id: "test-user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);
      const timesheetId = "ts-id";
      const createEntryDto: CreateTimesheetEntryDto = { actionCodeId: "ac-id", day: new Date().toISOString(), durationMin: 60 };
      const responseDto: Timesheet = {
        id: timesheetId,
        totalMinutes: 60,
      } as any;

      timesheetService.addTimesheetEntry.mockResolvedValue(responseDto);

      // Act
      const response = await request(global.testServer)
        .post(`/api/timesheets/${timesheetId}/entries`)
        .set("Authorization", `Bearer ${token}`)
        .send(createEntryDto);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
    });
  });

  describe("PUT /api/timesheets/{id}/submit", () => {
    it("should return 200 OK and the submitted timesheet", async () => {
      // Arrange
      const user = {
        id: "test-user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);
      const timesheetId = "ts-id";
      const responseDto: Timesheet = {
        id: timesheetId,
        status: "submitted",
      } as any;

      timesheetService.submitTimesheet.mockResolvedValue(responseDto);

      // Act
      const response = await request(global.testServer)
        .put(`/api/timesheets/${timesheetId}/submit`)
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
    });
  });

  describe("PUT /api/timesheets/{id}/approve", () => {
    it("should return 200 OK and the approved timesheet for admin/manager users", async () => {
      // Arrange
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const timesheetId = "ts-id";
      const responseDto: Timesheet = {
        id: timesheetId,
        status: "approved",
      } as any;

      timesheetService.approveTimesheet.mockResolvedValue(responseDto);

      // Act
      const response = await request(global.testServer)
        .put(`/api/timesheets/${timesheetId}/approve`)
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
    });

    it("should return 403 Forbidden for non-admin/manager users", async () => {
      // Arrange
      const user = {
        id: "user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);
      const timesheetId = "ts-id";

      // Act
      const response = await request(global.testServer)
        .put(`/api/timesheets/${timesheetId}/approve`)
        .set("Authorization", `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(403);
    });
  });

  describe("PUT /api/timesheets/{id}/reject", () => {
    it("should return 200 OK and the rejected timesheet for admin/manager users", async () => {
      // Arrange
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const timesheetId = "ts-id";
      const reason = "Incorrect entries";
      const responseDto: Timesheet = {
        id: timesheetId,
        status: "rejected",
      } as any;

      timesheetService.rejectTimesheet.mockResolvedValue(responseDto);

      // Act
      const response = await request(global.testServer)
        .put(`/api/timesheets/${timesheetId}/reject`)
        .set("Authorization", `Bearer ${token}`)
        .send({ reason });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
    });

    it("should return 403 Forbidden for non-admin/manager users", async () => {
      // Arrange
      const user = {
        id: "user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);
      const timesheetId = "ts-id";
      const reason = "Incorrect entries";

      // Act
      const response = await request(global.testServer)
        .put(`/api/timesheets/${timesheetId}/reject`)
        .set("Authorization", `Bearer ${token}`)
        .send({ reason });

      // Assert
      expect(response.status).toBe(403);
    });
  });
});