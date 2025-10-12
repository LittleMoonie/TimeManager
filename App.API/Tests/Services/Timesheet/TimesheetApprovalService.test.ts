import { TimesheetApprovalService } from "../../../Services/Timesheet/TimesheetApprovalService";
import { TimesheetApprovalRepository } from "../../../Repositories/Timesheets/TimesheetApprovalRepository";
import { NotFoundError } from "../../../Errors/HttpErrors";
import { UpdateTimesheetApprovalDto } from "@/Dtos/Timesheet/TimesheetApprovalDto";
import { ApprovalStatus } from "@Entities/Timesheets/TimesheetApproval";

describe("TimesheetApprovalService", () => {
  let service: TimesheetApprovalService;
  let timesheetApprovalRepository: jest.Mocked<Partial<TimesheetApprovalRepository>>;

  beforeEach(() => {
    timesheetApprovalRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // ✅ Properly inject the repository
    service = new TimesheetApprovalService(timesheetApprovalRepository as any);

    jest.clearAllMocks();
  });

  // ------------------- createTimesheetApproval -------------------
  describe("createTimesheetApproval", () => {
    it("creates a new timesheet approval record", async () => {
      const companyId = "company-id";
      const createDto = { timesheetId: "ts-id", approverId: "approver-id" };

      await service.createTimesheetApproval(companyId, createDto);

      expect(timesheetApprovalRepository.create).toHaveBeenCalledWith({
        companyId,
        ...createDto,
      });
    });
  });

  // ------------------- getTimesheetApprovalById -------------------
  describe("getTimesheetApprovalById", () => {
    it("returns an existing timesheet approval", async () => {
      const approvalId = "approval-id";
      const approval = { id: approvalId, status: "pending" };
      (timesheetApprovalRepository.findById as jest.Mock).mockResolvedValue(approval as any);

      const result = await service.getTimesheetApprovalById(approvalId);

      expect(result).toEqual(approval);
      expect(timesheetApprovalRepository.findById).toHaveBeenCalledWith(approvalId);
    });

    it("throws NotFoundError if approval not found", async () => {
      const approvalId = "missing-id";
      (timesheetApprovalRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getTimesheetApprovalById(approvalId)).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------- updateTimesheetApproval -------------------
  describe("updateTimesheetApproval", () => {
    it("updates an existing timesheet approval", async () => {
      const approvalId = "approval-id";
      const updateDto: UpdateTimesheetApprovalDto = { status: ApprovalStatus.APPROVED };
      const existing = { id: approvalId, status: "pending" };
      (timesheetApprovalRepository.findById as jest.Mock).mockResolvedValue(existing);

      await service.updateTimesheetApproval(approvalId, updateDto);

      expect(timesheetApprovalRepository.findById).toHaveBeenCalledWith(approvalId);
      expect(timesheetApprovalRepository.update).toHaveBeenCalledWith(approvalId, updateDto);
    });

    it("throws NotFoundError if approval to update does not exist", async () => {
      const approvalId = "missing-id";
      const updateDto: UpdateTimesheetApprovalDto = { status: ApprovalStatus.APPROVED };
      (timesheetApprovalRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.updateTimesheetApproval(approvalId, updateDto)).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------- deleteTimesheetApproval -------------------
  describe("deleteTimesheetApproval", () => {
    it("deletes a timesheet approval", async () => {
      const approvalId = "approval-id";
      const existing = { id: approvalId, status: "approved" };
      (timesheetApprovalRepository.findById as jest.Mock).mockResolvedValue(existing);

      await service.deleteTimesheetApproval(approvalId);

      expect(timesheetApprovalRepository.findById).toHaveBeenCalledWith(approvalId);
      expect(timesheetApprovalRepository.delete as jest.Mock).toHaveBeenCalledWith(approvalId);
    });

    it("throws NotFoundError if approval to delete does not exist", async () => {
      const approvalId = "missing-id";
      (timesheetApprovalRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteTimesheetApproval(approvalId)).rejects.toThrow(NotFoundError);
    });
  });
});
