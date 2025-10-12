import { ActionCodeService } from "../../../Services/Timesheet/ActionCodeService";
import { ActionCodeRepository } from "../../../Repositories/Timesheets/ActionCodeRepository";
import { TimesheetHistoryService } from "../../../Services/Logs/Timesheet/TimesheetHistoryService";
import { NotFoundError } from "../../../Errors/HttpErrors";
import { ActionCode } from "../../../Entities/Timesheets/ActionCode";
import { UpdateActionCodeDto } from "@/Dtos/Timesheet/ActionCodeDto";

describe("ActionCodeService", () => {
  let service: ActionCodeService;
  let actionCodeRepository: jest.Mocked<Partial<ActionCodeRepository>>;
  let timesheetHistoryService: jest.Mocked<Partial<TimesheetHistoryService>>;

  beforeEach(() => {
    actionCodeRepository = {
      findAll: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    timesheetHistoryService = {
      recordEvent: jest.fn(),
    };

    service = new ActionCodeService(
      actionCodeRepository as any,
      timesheetHistoryService as any
    );

    jest.clearAllMocks();
  });

  // ------------------- search -------------------
  describe("search", () => {
    it("returns all action codes if no query provided", async () => {
      const companyId = "company-id";
      const actionCodes = [{ id: "ac-1" }, { id: "ac-2" }];
      (actionCodeRepository.findAll as jest.Mock).mockResolvedValue(actionCodes as any);

      const result = await service.search(companyId);

      expect(result).toEqual(actionCodes);
      expect(actionCodeRepository.findAll).toHaveBeenCalledWith(companyId);
    });

    it("filters action codes case-insensitively", async () => {
      const companyId = "company-id";
      const actionCodes = [
        { id: "ac-1", name: "Vacation", code: "VAC" },
        { id: "ac-2", name: "Meeting", code: "MEET" },
      ];
      (actionCodeRepository.findAll as jest.Mock).mockResolvedValue(actionCodes as any);

      const result = await service.search(companyId, "VAC");

      expect(result).toEqual([{ id: "ac-1", name: "Vacation", code: "VAC" }]);
    });
  });

  // ------------------- create -------------------
  describe("create", () => {
    it("creates a new action code and records a history event", async () => {
      const companyId = "company-id";
      const actorUserId = "user-id";
      const createDto = { code: "NEW", name: "New Action" };
      const newActionCode = { id: "ac-id", ...createDto } as ActionCode;

      (actionCodeRepository.create as jest.Mock).mockResolvedValue(newActionCode);

      const result = await service.create(companyId, actorUserId, createDto);

      expect(actionCodeRepository.create).toHaveBeenCalledWith({
        companyId,
        ...createDto,
      });
      expect(timesheetHistoryService.recordEvent).toHaveBeenCalledWith(
        companyId,
        expect.objectContaining({
          userId: actorUserId,
          targetType: "ActionCode",
          targetId: newActionCode.id,
          action: "created",
        })
      );
      expect(result).toEqual(newActionCode);
    });
  });

  // ------------------- update -------------------
  describe("update", () => {
    it("updates an existing action code and records a history event", async () => {
      const companyId = "company-id";
      const actorUserId = "user-id";
      const actionCodeId = "ac-id";
      const updateDto = { name: "Updated Action" };

      const existingActionCode = {
        id: actionCodeId,
        companyId,
        name: "Old Name",
      } as ActionCode;
      const updatedActionCode = {
        ...existingActionCode,
        ...updateDto,
      } as ActionCode;

      (actionCodeRepository.findById as jest.Mock).mockResolvedValue(existingActionCode);
      (actionCodeRepository.update as jest.Mock).mockResolvedValue(updatedActionCode);

      const result = await service.update(
        companyId,
        actorUserId,
        actionCodeId,
        updateDto as UpdateActionCodeDto
      );

      expect(actionCodeRepository.findById).toHaveBeenCalledWith(actionCodeId);
      expect(actionCodeRepository.update).toHaveBeenCalledWith(
        actionCodeId,
        updateDto as UpdateActionCodeDto
      );
      expect(timesheetHistoryService.recordEvent).toHaveBeenCalledWith(
        companyId,
        expect.objectContaining({
          userId: actorUserId,
          targetType: "ActionCode",
          targetId: actionCodeId,
          action: "updated",
          diff: {
            old: existingActionCode,
            new: updatedActionCode,
          },
        })
      );
      expect(result).toEqual(updatedActionCode);
    });

    it("throws NotFoundError if action code does not exist", async () => {
      const companyId = "company-id";
      const actorUserId = "user-id";
      const actionCodeId = "missing-id";
      const updateDto = { name: "Updated Action" };

      (actionCodeRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update(companyId, actorUserId, actionCodeId, updateDto as UpdateActionCodeDto)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------- delete -------------------
  describe("delete", () => {
    it("deletes an action code and records a history event", async () => {
      const companyId = "company-id";
      const actorUserId = "user-id";
      const actionCodeId = "ac-id";

      const existingActionCode = { id: actionCodeId, companyId } as ActionCode;
      (actionCodeRepository.findById as jest.Mock).mockResolvedValue(existingActionCode);

      await service.delete(companyId, actorUserId, actionCodeId);

      expect(actionCodeRepository.findById).toHaveBeenCalledWith(actionCodeId);
      expect(actionCodeRepository.delete as jest.Mock).toHaveBeenCalledWith(actionCodeId);
      expect(timesheetHistoryService.recordEvent).toHaveBeenCalledWith(
        companyId,
        expect.objectContaining({
          userId: actorUserId,
          targetType: "ActionCode",
          targetId: actionCodeId,
          action: "deleted",
        })
      );
    });

    it("throws NotFoundError if action code not found before delete", async () => {
      const companyId = "company-id";
      const actorUserId = "user-id";
      const actionCodeId = "missing-ac-id";

      (actionCodeRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.delete(companyId, actorUserId, actionCodeId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
