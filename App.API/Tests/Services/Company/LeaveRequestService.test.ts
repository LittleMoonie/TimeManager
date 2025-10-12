import { LeaveRequestService } from "../../../Services/Company/LeaveRequestService";
import { LeaveRequestRepository } from "../../../Repositories/Companies/LeaveRequestRepository";
import { RolePermissionService } from "../../../Services/User/RolePermissionService";
import { ForbiddenError, NotFoundError } from "../../../Errors/HttpErrors";
import User from "../../../Entities/Users/User";
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
} from "@/Dtos/Company/LeaveRequestDto";

describe("LeaveRequestService", () => {
  let service: LeaveRequestService;
  let leaveRequestRepository: jest.Mocked<Partial<LeaveRequestRepository>>;
  let rolePermissionService: jest.Mocked<Partial<RolePermissionService>>;

  beforeEach(() => {
    leaveRequestRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    rolePermissionService = {
      checkPermission: jest.fn(),
    };

    service = new LeaveRequestService(
      leaveRequestRepository as any,
      rolePermissionService as any
    );

    jest.clearAllMocks();
  });

  // ------------------- createLeaveRequest -------------------
  describe("createLeaveRequest", () => {
    it("creates a leave request if user has permission", async () => {
      const actingUser = { id: "user-id" } as User;
      const companyId = "company-id";
      const createDto = { userId: "user-id", reason: "Vacation" };
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);

      await service.createLeaveRequest(
        actingUser,
        companyId,
        createDto as CreateLeaveRequestDto
      );

      expect(leaveRequestRepository.create).toHaveBeenCalledWith({
        companyId,
        ...createDto,
      });
      expect(rolePermissionService.checkPermission).toHaveBeenCalledWith(
        actingUser,
        "leave:create"
      );
    });

    it("throws ForbiddenError if user lacks permission", async () => {
      const actingUser = { id: "user-id" } as User;
      const companyId = "company-id";
      const createDto = { userId: "other-id", reason: "Vacation" };

      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(false);

      await expect(
        service.createLeaveRequest(actingUser, companyId, createDto as CreateLeaveRequestDto)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // ------------------- getLeaveRequestById -------------------
  describe("getLeaveRequestById", () => {
    it("returns a leave request if found", async () => {
      const companyId = "company-id";
      const leaveRequestId = "lr-id";
      const leaveRequest = { id: leaveRequestId, companyId };

      (leaveRequestRepository.findById as jest.Mock).mockResolvedValue(leaveRequest as any);

      const result = await service.getLeaveRequestById(companyId, leaveRequestId);

      expect(result).toEqual(leaveRequest);
      expect(leaveRequestRepository.findById).toHaveBeenCalledWith(
        companyId,
        leaveRequestId
      );
    });

    it("throws NotFoundError if not found", async () => {
      const companyId = "company-id";
      const leaveRequestId = "missing-id";

      (leaveRequestRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getLeaveRequestById(companyId, leaveRequestId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------- getAllLeaveRequests -------------------
  describe("getAllLeaveRequests", () => {
    it("returns all leave requests for a company", async () => {
      const leaveRequests = [{ id: "lr-1" }, { id: "lr-2" }];

      (leaveRequestRepository.findAll as jest.Mock).mockResolvedValue(leaveRequests as any);

      const result = await service.getAllLeaveRequests();

      expect(result).toEqual(leaveRequests);
      expect(leaveRequestRepository.findAll).toHaveBeenCalledWith();
    });
  });

  // ------------------- updateLeaveRequest -------------------
  describe("updateLeaveRequest", () => {
    it("updates a leave request if user has permission", async () => {
      const actingUser = { id: "user-id" } as User;
      const companyId = "company-id";
      const leaveRequestId = "lr-id";
      const updateDto = { reason: "Updated reason" };
      const leaveRequest = { id: leaveRequestId, companyId, userId: "user-id" };

      (leaveRequestRepository.findById as jest.Mock).mockResolvedValue(leaveRequest as any);
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);

      await service.updateLeaveRequest(
        actingUser,
        companyId,
        leaveRequestId,
        updateDto as UpdateLeaveRequestDto
      );

      expect(leaveRequestRepository.update).toHaveBeenCalledWith(
        leaveRequestId,
        updateDto
      );
      expect(rolePermissionService.checkPermission).toHaveBeenCalledWith(
        actingUser,
        "leave:update"
      );
    });

    it("throws ForbiddenError if user lacks permission", async () => {
      const actingUser = { id: "user-id" } as User;
      const companyId = "company-id";
      const leaveRequestId = "lr-id";
      const updateDto = { reason: "Updated reason" };

      const leaveRequest = { id: leaveRequestId, companyId };
      (leaveRequestRepository.findById as jest.Mock).mockResolvedValue(leaveRequest as any);
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updateLeaveRequest(
          actingUser,
          companyId,
          leaveRequestId,
          updateDto as UpdateLeaveRequestDto
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError if target leave request does not exist", async () => {
      const actingUser = { id: "user-id" } as User;
      const companyId = "company-id";
      const leaveRequestId = "missing-id";

      (leaveRequestRepository.findById as jest.Mock).mockResolvedValue(null);
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);

      await expect(
        service.updateLeaveRequest(actingUser, companyId, leaveRequestId, {
          reason: "Updated",
        } as UpdateLeaveRequestDto)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------- deleteLeaveRequest -------------------
  describe("deleteLeaveRequest", () => {
    it("soft deletes a leave request if user has permission", async () => {
      const actingUser = { id: "user-id" } as User;
      const companyId = "company-id";
      const leaveRequestId = "lr-id";
      const leaveRequest = { id: leaveRequestId, companyId };

      (leaveRequestRepository.findById as jest.Mock).mockResolvedValue(leaveRequest as any);
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);

      await service.deleteLeaveRequest(actingUser, companyId, leaveRequestId);

      expect(leaveRequestRepository.softDelete).toHaveBeenCalledWith(
        leaveRequestId
      );
      expect(rolePermissionService.checkPermission).toHaveBeenCalledWith(
        actingUser,
        "leave:delete"
      );
    });

    it("throws ForbiddenError if user lacks permission", async () => {
      const actingUser = { id: "user-id" } as User;
      const companyId = "company-id";
      const leaveRequestId = "lr-id";

      const leaveRequest = { id: leaveRequestId, companyId };
      (leaveRequestRepository.findById as jest.Mock).mockResolvedValue(leaveRequest as any);
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(false);

      await expect(
        service.deleteLeaveRequest(actingUser, companyId, leaveRequestId)
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError if leave request is missing", async () => {
      const actingUser = { id: "user-id" } as User;
      const companyId = "company-id";
      const leaveRequestId = "missing-id";

      (leaveRequestRepository.findById as jest.Mock).mockResolvedValue(null);
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);

      await expect(
        service.deleteLeaveRequest(actingUser, companyId, leaveRequestId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
