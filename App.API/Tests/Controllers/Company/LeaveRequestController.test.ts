import request from "supertest";
import { Express } from "express";
import { Container } from "typedi";
import { createTestApp } from "../../TestHelper";
import { LeaveRequestService } from "../../../Services/Company/LeaveRequestService";
import { UserService } from "../../../Services/User/UserService";
import { sign } from "jsonwebtoken";
import { LeaveRequestResponseDto } from "../../../Dtos/Company/LeaveRequestDto";
import { LeaveRequest } from "@Entities/Companies/LeaveRequest";

// ---- Mock the services ----
jest.mock("../../../Services/Company/LeaveRequestService");
jest.mock("../../../Services/User/UserService");

const generateToken = (payload: object) =>
  sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1h",
  });

describe("LeaveRequestController", () => {
  let app: Express;
  let leaveRequestService: jest.Mocked<LeaveRequestService>;
  let userService: jest.Mocked<UserService>;

  beforeAll(async () => {
    // Create a fresh test app instance for this suite
    app = (await createTestApp()) as Express;
  });

  beforeEach(() => {
    // Fresh mocks for each test
    leaveRequestService = {
      createLeaveRequest: jest.fn(),
      getLeaveRequestById: jest.fn(),
      getAllLeaveRequests: jest.fn(),
      updateLeaveRequest: jest.fn(),
      deleteLeaveRequest: jest.fn(),
    } as any;

    userService = {
      getUserById: jest.fn(),
    } as any;

    // Register mocks in TypeDI
    Container.set(LeaveRequestService, leaveRequestService);
    Container.set(UserService, userService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Container.reset();
  });

  // ---- POST /api/leave-requests ----
  describe("POST /api/leave-requests", () => {
    it("returns 200 OK and the created leave request", async () => {
      const user = { id: "u1", companyId: "c1", roles: ["user"] };
      const token = generateToken(user);

      const createDto = { userId: user.id, reason: "Vacation" };
      const responseDto: LeaveRequestResponseDto = { id: "lr1", ...createDto } as any;

      userService.getUserById.mockResolvedValue(user as any);
      leaveRequestService.createLeaveRequest.mockResolvedValue(responseDto as LeaveRequest);

      const response = await request(app)
        .post("/api/leave-requests")
        .set("Authorization", `Bearer ${token}`)
        .send(createDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(leaveRequestService.createLeaveRequest).toHaveBeenCalledWith(
        user,
        createDto
      );
    });
  });

  // ---- GET /api/leave-requests/:id ----
  describe("GET /api/leave-requests/:id", () => {
    it("returns 200 OK and the leave request data", async () => {
      const user = { id: "u1", companyId: "c1", roles: ["user"] };
      const token = generateToken(user);

      const leaveRequestId = "lr1";
      const responseDto: LeaveRequestResponseDto = { id: leaveRequestId } as any;

      leaveRequestService.getLeaveRequestById.mockResolvedValue(responseDto as LeaveRequest);

      const response = await request(app)
        .get(`/api/leave-requests/${leaveRequestId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(leaveRequestService.getLeaveRequestById).toHaveBeenCalledWith(
        user.companyId,
        leaveRequestId
      );
    });
  });

  // ---- GET /api/leave-requests ----
  describe("GET /api/leave-requests", () => {
    it("returns 200 OK and an array of leave requests", async () => {
      const user = { id: "u1", companyId: "c1", roles: ["user"] };
      const token = generateToken(user);

      const responseDto: LeaveRequestResponseDto[] = [
        { id: "lr1" } as any,
        { id: "lr2" } as any,
      ];

      leaveRequestService.getAllLeaveRequests.mockResolvedValue(responseDto as LeaveRequest[]);

      const response = await request(app)
        .get("/api/leave-requests")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(leaveRequestService.getAllLeaveRequests).toHaveBeenCalledWith(
        user.companyId
      );
    });
  });

  // ---- PUT /api/leave-requests/:id ----
  describe("PUT /api/leave-requests/:id", () => {
    it("returns 200 OK and the updated leave request", async () => {
      const user = { id: "u1", companyId: "c1", roles: ["user"] };
      const token = generateToken(user);

      const leaveRequestId = "lr1";
      const updateDto = { reason: "Updated reason" };
      const responseDto: LeaveRequestResponseDto = { id: leaveRequestId, ...updateDto } as any;

      userService.getUserById.mockResolvedValue(user as any);
      leaveRequestService.updateLeaveRequest.mockResolvedValue(responseDto as LeaveRequest);

      const response = await request(app)
        .put(`/api/leave-requests/${leaveRequestId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(leaveRequestService.updateLeaveRequest).toHaveBeenCalledWith(
        user,
        leaveRequestId,
        updateDto
      );
    });
  });

  // ---- DELETE /api/leave-requests/:id ----
  describe("DELETE /api/leave-requests/:id", () => {
    it("returns 204 No Content on successful deletion", async () => {
      const user = { id: "u1", companyId: "c1", roles: ["user"] };
      const token = generateToken(user);
      const leaveRequestId = "lr1";

      userService.getUserById.mockResolvedValue(user as any);

      leaveRequestService.deleteLeaveRequest.mockResolvedValue();

      const response = await request(app)
        .delete(`/api/leave-requests/${leaveRequestId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);
      expect(leaveRequestService.deleteLeaveRequest).toHaveBeenCalledWith(
        user,
        leaveRequestId
      );
    });
  });
});
