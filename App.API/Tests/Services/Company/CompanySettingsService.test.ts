import { CompanySettingsService } from "../../../Services/Company/CompanySettingsService";
import { CompanySettingsRepository } from "../../../Repositories/Companies/CompanySettingsRepository";
import { RolePermissionService } from "../../../Services/User/RolePermissionService";
import { ForbiddenError, NotFoundError } from "../../../Errors/HttpErrors";
import User from "../../../Entities/Users/User";

describe("CompanySettingsService", () => {
  let service: CompanySettingsService;
  let companySettingsRepository: jest.Mocked<Partial<CompanySettingsRepository>>;
  let rolePermissionService: jest.Mocked<Partial<RolePermissionService>>;

  beforeEach(() => {
    companySettingsRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    rolePermissionService = {
      checkPermission: jest.fn(),
    };

    service = new CompanySettingsService(
      companySettingsRepository as any,
      rolePermissionService as any
    );

    jest.clearAllMocks();
  });

  // ------------------- getCompanySettings -------------------
  describe("getCompanySettings", () => {
    it("returns company settings when found", async () => {
      const companyId = "test-company-id";
      const settings = { companyId, timezone: "UTC" };
      (companySettingsRepository.findById as jest.Mock).mockResolvedValue(settings as any);

      const result = await service.getCompanySettings(companyId);

      expect(result).toEqual(settings);
      expect(companySettingsRepository.findById).toHaveBeenCalledWith(companyId);
    });

    it("throws NotFoundError when settings are not found", async () => {
      const companyId = "missing-company-id";
      (companySettingsRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getCompanySettings(companyId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  // ------------------- updateCompanySettings -------------------
  describe("updateCompanySettings", () => {
    it("updates company settings if user has permission", async () => {
      const actingUser = { id: "admin-user" } as User;
      const companyId = "test-company-id";
      const updateDto = { timezone: "PST" };
      const settings = { companyId, timezone: "UTC" };

      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);
      (companySettingsRepository.findById as jest.Mock).mockResolvedValue(settings as any);

      await service.updateCompanySettings(actingUser, companyId, updateDto);

      expect(rolePermissionService.checkPermission).toHaveBeenCalledWith(
        actingUser,
        "company:update-settings"
      );
      expect(companySettingsRepository.update).toHaveBeenCalledWith(
        companyId,
        updateDto
      );
    });

    it("throws ForbiddenError if user lacks permission", async () => {
      const actingUser = { id: "user" } as User;
      const companyId = "test-company-id";
      const updateDto = { timezone: "PST" };

      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updateCompanySettings(actingUser, companyId, updateDto)
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError if settings not found before update", async () => {
      const actingUser = { id: "admin-user" } as User;
      const companyId = "missing-company-id";
      const updateDto = { timezone: "CET" };

      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);
      (companySettingsRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateCompanySettings(actingUser, companyId, updateDto)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
