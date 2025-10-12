import { PermissionService } from "../../../Services/PermissionService/PermissionService";
import { PermissionRepository } from "../../../Repositories/Users/PermissionRepository";
import { NotFoundError } from "../../../Errors/HttpErrors";
import { UpdatePermissionDto } from "@/Dtos/Users/PermissionDto";

describe("PermissionService", () => {
  let service: PermissionService;
  let permissionRepository: jest.Mocked<Partial<PermissionRepository>>;

  beforeEach(() => {
    permissionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // ✅ inject mock repo properly
    service = new PermissionService();

    jest.clearAllMocks();
  });

  // ------------------- createPermission -------------------
  describe("createPermission", () => {
    it("creates a permission", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const createDto = { name: "new.permission" };

      await service.createPermission(companyId, userId, createDto);

      expect(permissionRepository.create).toHaveBeenCalledWith({
        ...createDto,
        companyId,
        createdBy: userId,
      });
    });
  });

  // ------------------- getPermissionById -------------------
  describe("getPermissionById", () => {
    it("returns a permission if found", async () => {
      const companyId = "company-id";
      const permissionId = "perm-id";
      const permission = { id: permissionId, companyId };

      (permissionRepository.findById as jest.Mock).mockResolvedValue(permission as any);

      const result = await service.getPermissionById(companyId, permissionId);

      expect(result).toEqual(permission);
      expect(permissionRepository.findById).toHaveBeenCalledWith(
        companyId,
        permissionId
      );
    });

    it("throws NotFoundError if permission not found", async () => {
      const companyId = "company-id";
      const permissionId = "missing-id";
      (permissionRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getPermissionById(companyId, permissionId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------- getAllPermissions -------------------
  describe("getAllPermissions", () => {
    it("returns all permissions for a company", async () => {
      const companyId = "company-id";
      const permissions = [{ id: "perm-1" }, { id: "perm-2" }];

      (permissionRepository.findAll as jest.Mock).mockResolvedValue(permissions as any);

      const result = await service.getAllPermissions(companyId);

      expect(result).toEqual(permissions);
      expect(permissionRepository.findAll).toHaveBeenCalledWith(companyId);
    });
  });

  // ------------------- updatePermission -------------------
  describe("updatePermission", () => {
    it("updates a permission", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const permissionId = "perm-id";
      const updateDto = { name: "updated.permission" };

      await service.updatePermission(
        companyId,
        userId,
        permissionId,
        updateDto as UpdatePermissionDto
      );

      expect(permissionRepository.update).toHaveBeenCalledWith(permissionId, {
        ...updateDto,
        updatedBy: userId,
      });
    });

    it("throws NotFoundError if permission to update is missing", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const permissionId = "missing-id";
      const updateDto = { name: "updated.permission" };

      (permissionRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updatePermission(companyId, userId, permissionId, updateDto)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------- deletePermission -------------------
  describe("deletePermission", () => {
    it("deletes a permission", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const permissionId = "perm-id";

      await service.deletePermission(companyId, userId, permissionId);

      expect(permissionRepository.delete).toHaveBeenCalledWith(permissionId);
    });

    it("throws NotFoundError if permission does not exist", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const permissionId = "missing-id";

      (permissionRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.deletePermission(companyId, userId, permissionId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
