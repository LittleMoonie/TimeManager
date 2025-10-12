import { RoleService } from "../../../Services/RoleService/RoleService";
import { RoleRepository } from "../../../Repositories/Users/RoleRepository";
import { PermissionRepository } from "../../../Repositories/Users/PermissionRepository";
import { NotFoundError } from "../../../Errors/HttpErrors";
import { UpdateRoleDto } from "@/Dtos/Users/RoleDto";

describe("RoleService", () => {
  let service: RoleService;
  let roleRepository: jest.Mocked<Partial<RoleRepository>>;
  let permissionRepository: jest.Mocked<Partial<PermissionRepository>>;

  beforeEach(() => {
    roleRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      addPermission: jest.fn(),
      removePermission: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    permissionRepository = {
      findById: jest.fn(),
    };

    // ✅ inject repositories properly
    service = new RoleService();

    jest.clearAllMocks();
  });

  // ------------------- createRole -------------------
  describe("createRole", () => {
    it("creates a role", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const createDto = { name: "New Role" };

      await service.createRole(companyId, userId, createDto);

      expect(roleRepository.create).toHaveBeenCalledWith({
        ...createDto,
        companyId,
        createdBy: userId,
      });
    });
  });

  // ------------------- getRoleById -------------------
  describe("getRoleById", () => {
    it("returns a role if found", async () => {
      const companyId = "company-id";
      const roleId = "role-id";
      const role = { id: roleId, companyId };
      (roleRepository.findById as jest.Mock).mockResolvedValue(role as any);

      const result = await service.getRoleById(companyId, roleId);

      expect(result).toEqual(role);
      expect(roleRepository.findById).toHaveBeenCalledWith(companyId, roleId);
    });

    it("throws NotFoundError if not found", async () => {
      const companyId = "company-id";
      const roleId = "missing-role";
      (roleRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getRoleById(companyId, roleId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  // ------------------- getAllRoles -------------------
  describe("getAllRoles", () => {
    it("returns all roles for a company", async () => {
      const companyId = "company-id";
      const roles = [{ id: "r1" }, { id: "r2" }];
      (roleRepository.findAll as jest.Mock).mockResolvedValue(roles as any);

      const result = await service.getAllRoles(companyId);

      expect(result).toEqual(roles);
      expect(roleRepository.findAll).toHaveBeenCalledWith(companyId);
    });
  });

  // ------------------- updateRole -------------------
  describe("updateRole", () => {
    it("updates a role", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const roleId = "role-id";
      const updateDto = { name: "Updated Role" };

      await service.updateRole(companyId, userId, roleId, updateDto);

      expect(roleRepository.update).toHaveBeenCalledWith(roleId, {
        ...updateDto,
        updatedBy: userId,
      });
    });

    it("throws NotFoundError if role not found before update", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const roleId = "missing-id";
      const updateDto = { name: "Updated Role" };

      (roleRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateRole(companyId, userId, roleId, updateDto as UpdateRoleDto)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------- deleteRole -------------------
  describe("deleteRole", () => {
    it("deletes a role", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const roleId = "role-id";

      await service.deleteRole(companyId, userId, roleId);

      expect(roleRepository.delete).toHaveBeenCalledWith(roleId);
    });

    it("throws NotFoundError if role not found before delete", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const roleId = "missing-id";

      (roleRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.deleteRole(companyId, userId, roleId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------- addPermissionToRole -------------------
  describe("addPermissionToRole", () => {
    it("adds a permission to a role", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const roleId = "role-id";
      const permissionId = "perm-id";

      const role = { id: roleId, companyId };
      const permission = { id: permissionId, companyId };

      (roleRepository.findById as jest.Mock).mockResolvedValue(role as any);
      (permissionRepository.findById as jest.Mock).mockResolvedValue(permission as any);

      await service.addPermissionToRole(companyId, userId, roleId, permissionId);

      expect(roleRepository.addPermission as jest.Mock).toHaveBeenCalledWith(
        roleId,
        permissionId,
        companyId
      );
    });

    it("throws NotFoundError if role not found", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const roleId = "missing-role";
      const permissionId = "perm-id";

      (roleRepository.findById as jest.Mock).mockResolvedValue(null);
      (permissionRepository.findById as jest.Mock).mockResolvedValue({ id: permissionId } as any);

      await expect(
        service.addPermissionToRole(companyId, userId, roleId, permissionId)
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError if permission not found", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const roleId = "role-id";
      const permissionId = "missing-perm";

      (roleRepository.findById as jest.Mock).mockResolvedValue({ id: roleId } as any);
      (permissionRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.addPermissionToRole(companyId, userId, roleId, permissionId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------- removePermissionFromRole -------------------
  describe("removePermissionFromRole", () => {
    it("removes a permission from a role", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const roleId = "role-id";
      const permissionId = "perm-id";

      await service.removePermissionFromRole(
        companyId,
        userId,
        roleId,
        permissionId
      );

      expect(roleRepository.removePermission as jest.Mock).toHaveBeenCalledWith(
        roleId,
        permissionId
      );
    });

    it("throws NotFoundError if role not found before removing permission", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const roleId = "missing-id";
      const permissionId = "perm-id";

      (roleRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.removePermissionFromRole(companyId, userId, roleId, permissionId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
