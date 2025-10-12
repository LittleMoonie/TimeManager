import { TimesheetService } from "../../../Services/Timesheet/TimesheetService";
import { TimesheetRepository } from "../../../Repositories/Timesheets/TimesheetRepository";
import { TimesheetEntryRepository } from "../../../Repositories/Timesheets/TimesheetEntryRepository";
import { TimesheetApprovalRepository } from "../../../Repositories/Timesheets/TimesheetApprovalRepository";
import { TimesheetHistoryService } from "../../../Services/Logs/Timesheet/TimesheetHistoryService";
import {
  NotFoundError,
  UnprocessableEntityError,
} from "../../../Errors/HttpErrors";
import {
  Timesheet,
  TimesheetStatus,
} from "../../../Entities/Timesheets/Timesheet";
import {
  CreateTimesheetDto,
  CreateTimesheetEntryDto,
} from "../../../Dtos/Timesheet/TimesheetDto";

describe("TimesheetService", () => {
  let service: TimesheetService;
  let timesheetRepository: jest.Mocked<Partial<TimesheetRepository>>;
  let timesheetEntryRepository: jest.Mocked<Partial<TimesheetEntryRepository>>;
  let timesheetApprovalRepository: jest.Mocked<Partial<TimesheetApprovalRepository>>;
  let timesheetHistoryService: jest.Mocked<Partial<TimesheetHistoryService>>;

  beforeEach(() => {
    timesheetRepository = {
      create: jest.fn(),
      findByIdWithRelations: jest.fn(),
      update: jest.fn(),
    };

    timesheetEntryRepository = {
      create: jest.fn(),
    };

    timesheetApprovalRepository = {};

    timesheetHistoryService = {
      recordEvent: jest.fn(),
    };

    service = new TimesheetService(
      timesheetRepository as any,
      timesheetEntryRepository as any,
      timesheetApprovalRepository as any,
      timesheetHistoryService as any
    );

    jest.clearAllMocks();
  });

  // ------------------- createTimesheet -------------------
  describe("createTimesheet", () => {
    it("creates a new timesheet and records a history event", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const createDto: CreateTimesheetDto = {
        periodStart: new Date().toISOString(),
        periodEnd: new Date().toISOString(),
      };
      const newTimesheet = { id: "ts-id", ...createDto } as Timesheet;

      (timesheetRepository.create as jest.Mock).mockResolvedValue(newTimesheet);

      const result = await service.createTimesheet(companyId, userId, createDto);

      expect(timesheetRepository.create).toHaveBeenCalledWith({
        companyId,
        userId,
        ...createDto,
      });
      expect(timesheetHistoryService.recordEvent).toHaveBeenCalledWith(
        companyId,
        expect.objectContaining({
          userId,
          targetType: "Timesheet",
          targetId: newTimesheet.id,
          action: "created",
        })
      );
      expect(result).toEqual(newTimesheet);
    });
  });

  // ------------------- getTimesheet -------------------
  describe("getTimesheet", () => {
    it("returns an existing timesheet with relations", async () => {
      const companyId = "company-id";
      const timesheetId = "ts-id";
      const timesheet = { id: timesheetId, companyId } as Timesheet;

      (timesheetRepository.findByIdWithRelations as jest.Mock).mockResolvedValue(timesheet);

      const result = await service.getTimesheet(companyId, timesheetId);

      expect(result).toEqual(timesheet);
      expect(timesheetRepository.findByIdWithRelations).toHaveBeenCalledWith(
        companyId,
        timesheetId
      );
    });

    it("throws NotFoundError if not found", async () => {
      const companyId = "company-id";
      const timesheetId = "missing-id";

      (timesheetRepository.findByIdWithRelations as jest.Mock).mockResolvedValue(null);

      await expect(service.getTimesheet(companyId, timesheetId)).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------- addTimesheetEntry -------------------
  describe("addTimesheetEntry", () => {
    it("adds a new entry, updates totalMinutes, and logs the event", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const timesheetId = "ts-id";
      const createEntryDto: CreateTimesheetEntryDto = {
        actionCodeId: "ac-id",
        day: new Date().toISOString(),
        durationMin: 60,
      };

      const timesheet = {
        id: timesheetId,
        totalMinutes: 0,
        companyId,
        userId,
      } as Timesheet;
      const newEntry = { id: "entry-id", durationMin: 60 } as any;

      (timesheetRepository.findByIdWithRelations as jest.Mock).mockResolvedValue(timesheet);
      (timesheetEntryRepository.create as jest.Mock).mockResolvedValue(newEntry);
      (timesheetRepository.update as jest.Mock).mockResolvedValue({
        ...timesheet,
        totalMinutes: 60,
      });

      const result = await service.addTimesheetEntry(companyId, userId, timesheetId, createEntryDto);

      expect(timesheetEntryRepository.create).toHaveBeenCalledWith({
        companyId,
        userId,
        timesheetId,
        ...createEntryDto,
      });
      expect(timesheetRepository.update).toHaveBeenCalledWith(timesheetId, { totalMinutes: 60 });
      expect(timesheetHistoryService.recordEvent).toHaveBeenCalledWith(
        companyId,
        expect.objectContaining({
          userId,
          targetType: "TimesheetEntry",
          targetId: newEntry.id,
          action: "created",
          metadata: { timesheetId },
        })
      );
      expect(result.totalMinutes).toBe(60);
    });

    it("throws NotFoundError if timesheet does not exist", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const timesheetId = "missing-id";
      const createEntryDto: CreateTimesheetEntryDto = {
        actionCodeId: "ac-id",
        day: new Date().toISOString(),
        durationMin: 60,
      };

      (timesheetRepository.findByIdWithRelations as jest.Mock).mockResolvedValue(null);

      await expect(
        service.addTimesheetEntry(companyId, userId, timesheetId, createEntryDto)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------- submitTimesheet -------------------
  describe("submitTimesheet", () => {
    it("submits a draft timesheet", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const timesheetId = "ts-id";
      const timesheet = { id: timesheetId, status: TimesheetStatus.DRAFT } as Timesheet;

      (timesheetRepository.findByIdWithRelations as jest.Mock).mockResolvedValue(timesheet);
      (timesheetRepository.update as jest.Mock).mockResolvedValue({
        ...timesheet,
        status: TimesheetStatus.SUBMITTED,
      });

      const result = await service.submitTimesheet(companyId, userId, timesheetId);

      expect(timesheetRepository.update).toHaveBeenCalledWith(
        timesheetId,
        expect.objectContaining({ status: TimesheetStatus.SUBMITTED })
      );
      expect(timesheetHistoryService.recordEvent).toHaveBeenCalledWith(
        companyId,
        expect.objectContaining({
          userId,
          targetType: "Timesheet",
          targetId: timesheetId,
          action: "submitted",
        })
      );
      expect(result.status).toBe(TimesheetStatus.SUBMITTED);
    });

    it("throws UnprocessableEntityError if status is not DRAFT", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const timesheetId = "ts-id";
      const timesheet = { id: timesheetId, status: TimesheetStatus.APPROVED } as Timesheet;

      (timesheetRepository.findByIdWithRelations as jest.Mock).mockResolvedValue(timesheet);

      await expect(service.submitTimesheet(companyId, userId, timesheetId)).rejects.toThrow(UnprocessableEntityError);
    });
  });

  // ------------------- approveTimesheet -------------------
  describe("approveTimesheet", () => {
    it("approves a submitted timesheet and logs the event", async () => {
      const companyId = "company-id";
      const approverId = "approver-id";
      const timesheetId = "ts-id";
      const timesheet = { id: timesheetId, status: TimesheetStatus.SUBMITTED, userId: "user-id" } as Timesheet;

      (timesheetRepository.findByIdWithRelations as jest.Mock).mockResolvedValue(timesheet);
      (timesheetRepository.update as jest.Mock).mockResolvedValue({
        ...timesheet,
        status: TimesheetStatus.APPROVED,
      });

      const result = await service.approveTimesheet(companyId, approverId, timesheetId);

      expect(timesheetRepository.update).toHaveBeenCalledWith(
        timesheetId,
        expect.objectContaining({ status: TimesheetStatus.APPROVED })
      );
      expect(timesheetHistoryService.recordEvent).toHaveBeenCalledWith(
        companyId,
        expect.objectContaining({
          actorUserId: approverId,
          action: "approved",
        })
      );
      expect(result.status).toBe(TimesheetStatus.APPROVED);
    });

    it("throws UnprocessableEntityError if status is not SUBMITTED", async () => {
      const companyId = "company-id";
      const approverId = "approver-id";
      const timesheetId = "ts-id";
      const timesheet = { id: timesheetId, status: TimesheetStatus.DRAFT } as Timesheet;

      (timesheetRepository.findByIdWithRelations as jest.Mock).mockResolvedValue(timesheet);

      await expect(
        service.approveTimesheet(companyId, approverId, timesheetId)
      ).rejects.toThrow(UnprocessableEntityError);
    });
  });

  // ------------------- rejectTimesheet -------------------
  describe("rejectTimesheet", () => {
    it("rejects a submitted timesheet with a reason", async () => {
      const companyId = "company-id";
      const approverId = "approver-id";
      const timesheetId = "ts-id";
      const reason = "Incorrect entries";
      const timesheet = { id: timesheetId, status: TimesheetStatus.SUBMITTED, userId: "user-id" } as Timesheet;

      (timesheetRepository.findByIdWithRelations as jest.Mock).mockResolvedValue(timesheet);
      (timesheetRepository.update as jest.Mock).mockResolvedValue({
        ...timesheet,
        status: TimesheetStatus.REJECTED,
      });

      const result = await service.rejectTimesheet(companyId, approverId, timesheetId, reason);

      expect(timesheetRepository.update).toHaveBeenCalledWith(
        timesheetId,
        expect.objectContaining({ status: TimesheetStatus.REJECTED })
      );
      expect(timesheetHistoryService.recordEvent).toHaveBeenCalledWith(
        companyId,
        expect.objectContaining({
          actorUserId: approverId,
          action: "rejected",
          reason,
        })
      );
      expect(result.status).toBe(TimesheetStatus.REJECTED);
    });

    it("throws UnprocessableEntityError if status is not SUBMITTED", async () => {
      const companyId = "company-id";
      const approverId = "approver-id";
      const timesheetId = "ts-id";
      const reason = "Incorrect entries";
      const timesheet = { id: timesheetId, status: TimesheetStatus.DRAFT } as Timesheet;

      (timesheetRepository.findByIdWithRelations as jest.Mock).mockResolvedValue(timesheet);

      await expect(
        service.rejectTimesheet(companyId, approverId, timesheetId, reason)
      ).rejects.toThrow(UnprocessableEntityError);
    });
  });
});
