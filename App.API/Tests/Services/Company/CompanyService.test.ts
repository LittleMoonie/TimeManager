import { CompanyService } from "../../../Services/Company/CompanyService";
import { CompanyRepository } from "../../../Repositories/Companies/CompanyRepository";
import { UserService } from "../../../Services/User/UserService";
import { RolePermissionService } from "../../../Services/RoleService/RolePermissionService";
import { ForbiddenError, NotFoundError } from "../../../Errors/HttpErrors";
import User from "../../../Entities/Users/User";

describe("CompanyService", () => {
  let service: CompanyService;
  let companyRepository: jest.Mocked<Partial<CompanyRepository>>;
  let userService: jest.Mocked<Partial<UserService>>;
  let rolePermissionService: jest.Mocked<Partial<RolePermissionService>>;

  beforeEach(() => {
    companyRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    userService = {
      updateUser: jest.fn(),
    };

    rolePermissionService = {
      checkPermission: jest.fn(),
    };

    service = new CompanyService(
      companyRepository as any,
      userService as any,
      rolePermissionService as any
    );

    jest.clearAllMocks();
  });

  // ----------------- createCompany -----------------
  describe("createCompany", () => {
    it("creates a company if user has permission", async () => {
      const actingUser = { id: 'admin-user' } as User;
      const createCompanyDto = { name: 'New Company' };
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);

      await service.createCompany(actingUser, createCompanyDto);

      expect(companyRepository.create).toHaveBeenCalledWith(createCompanyDto);
      expect(rolePermissionService.checkPermission).toHaveBeenCalledWith(
        actingUser,
        "company:create"
      );
    });

    it("throws ForbiddenError if user lacks permission", async () => {
      const actingUser = { id: "user" } as User;
      const createCompanyDto = { name: "New Company" };
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(false);

      await expect(
        service.createCompany(actingUser, createCompanyDto)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // ----------------- getCompanyById -----------------
  describe("getCompanyById", () => {
    it("returns a company if user has permission", async () => {
      const actingUser = { id: "user" } as User;
      const companyId = "test-company-id";
      const company = { id: companyId, name: "Test Company" };

      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);
      (companyRepository.findById as jest.Mock).mockResolvedValue(company as any);

      const result = await service.getCompanyById(actingUser, companyId);

      expect(result).toEqual(company);
      expect(rolePermissionService.checkPermission).toHaveBeenCalledWith(
        actingUser,
        "company:read"
      );
    });

    it("throws ForbiddenError if user lacks permission", async () => {
      const actingUser = { id: "user" } as User;
      const companyId = "test-company-id";
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(false);

      await expect(
        service.getCompanyById(actingUser, companyId)
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError if company not found", async () => {
      const actingUser = { id: "user" } as User;
      const companyId = "missing-company-id";
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);
      (companyRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getCompanyById(actingUser, companyId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ----------------- updateCompany -----------------
  describe("updateCompany", () => {
    it("updates a company if user has permission", async () => {
      const actingUser = { id: "admin-user" } as User;
      const companyId = "test-company-id";
      const updateCompanyDto = { name: "Updated Company" };
      const company = { id: companyId, name: "Old Company" };

      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);
      (companyRepository.findById as jest.Mock).mockResolvedValue(company as any);

      await service.updateCompany(actingUser, companyId, updateCompanyDto);

      expect(companyRepository.update).toHaveBeenCalledWith(
        companyId,
        updateCompanyDto
      );
    });

    it("throws NotFoundError if target company does not exist", async () => {
      const actingUser = { id: "admin-user" } as User;
      const companyId = "missing-id";
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);
      (companyRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateCompany(actingUser, companyId, { name: "X" })
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ----------------- addUserToCompany -----------------
  describe("addUserToCompany", () => {
    it("adds a user to a company if acting user has permission", async () => {
      const actingUser = { id: "admin-user" } as User;
      const companyId = "test-company-id";
      const userId = "test-user-id";

      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);

      await service.addUserToCompany(actingUser, companyId, userId);

      expect(userService.updateUser).toHaveBeenCalledWith(
        actingUser,
        companyId,
        userId,
        { companyId }
      );
    });

    it("throws ForbiddenError if acting user lacks permission", async () => {
      const actingUser = { id: "non-admin" } as User;
      const companyId = "test-company-id";
      const userId = "test-user-id";

      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(false);

      await expect(
        service.addUserToCompany(actingUser, companyId, userId)
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
