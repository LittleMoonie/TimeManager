import { TeamService } from "../../../Services/Company/TeamService";
import { TeamRepository } from "../../../Repositories/Companies/TeamRepository";
import { RolePermissionService } from "../../../Services/User/RolePermissionService";
import { ForbiddenError, NotFoundError } from "../../../Errors/HttpErrors";
import User from "../../../Entities/Users/User";

describe("TeamService", () => {
  let service: TeamService;
  let teamRepository: jest.Mocked<Partial<TeamRepository>>;
  let rolePermissionService: jest.Mocked<Partial<RolePermissionService>>;

  beforeEach(() => {
    teamRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    rolePermissionService = {
      checkPermission: jest.fn(),
    };

    service = new TeamService(teamRepository as any, rolePermissionService as any);

    jest.clearAllMocks();
  });

  // ------------------- createTeam -------------------
  describe("createTeam", () => {
    it("creates a team if user has permission", async () => {
      const actingUser = { id: "admin-user" } as User;
      const companyId = "company-id";
      const createDto = { name: "New Team" };
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);

      await service.createTeam(actingUser, companyId, createDto);

      expect(teamRepository.create).toHaveBeenCalledWith({
        companyId,
        ...createDto,
      });
      expect(rolePermissionService.checkPermission).toHaveBeenCalledWith(
        actingUser,
        "team:create"
      );
    });

    it("throws ForbiddenError if user lacks permission", async () => {
      const actingUser = { id: "user" } as User;
      const companyId = "company-id";
      const createDto = { name: "New Team" };
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(false);

      await expect(
        service.createTeam(actingUser, companyId, createDto)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // ------------------- getTeamById -------------------
  describe("getTeamById", () => {
    it("returns a team if found", async () => {
      const companyId = "company-id";
      const teamId = "team-id";
      const team = { id: teamId, companyId };

      (teamRepository.findById as jest.Mock).mockResolvedValue(team as any);

      const result = await service.getTeamById(companyId, teamId);

      expect(result).toEqual(team);
      expect(teamRepository.findById).toHaveBeenCalledWith(companyId, teamId);
    });

    it("throws NotFoundError if team is not found", async () => {
      const companyId = "company-id";
      const teamId = "missing-id";
      (teamRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getTeamById(companyId, teamId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  // ------------------- getAllTeams -------------------
  describe("getAllTeams", () => {
    it("returns all teams for a company", async () => {
      const companyId = "company-id";
      const teams = [{ id: "team-1" }, { id: "team-2" }];

      (teamRepository.findAll as jest.Mock).mockResolvedValue(teams as any);

      const result = await service.getAllTeams(companyId);

      expect(result).toEqual(teams);
      expect(teamRepository.findAll).toHaveBeenCalledWith(companyId);
    });
  });

  // ------------------- updateTeam -------------------
  describe("updateTeam", () => {
    it("updates a team if user has permission", async () => {
      const actingUser = { id: "admin-user" } as User;
      const companyId = "company-id";
      const teamId = "team-id";
      const updateDto = { name: "Updated Team" };
      const team = { id: teamId, companyId };

      (teamRepository.findById as jest.Mock).mockResolvedValue(team as any);
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);

      await service.updateTeam(actingUser, companyId, teamId, updateDto);

      expect(teamRepository.update).toHaveBeenCalledWith(teamId, updateDto);
      expect(rolePermissionService.checkPermission).toHaveBeenCalledWith(
        actingUser,
        "team:update"
      );
    });

    it("throws ForbiddenError if user lacks permission", async () => {
      const actingUser = { id: "user" } as User;
      const companyId = "company-id";
      const teamId = "team-id";
      const updateDto = { name: "Nope" };
      const team = { id: teamId, companyId };

      (teamRepository.findById as jest.Mock).mockResolvedValue(team as any);
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updateTeam(actingUser, companyId, teamId, updateDto)
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError if team does not exist", async () => {
      const actingUser = { id: "admin-user" } as User;
      const companyId = "company-id";
      const teamId = "missing-team";
      const updateDto = { name: "Updated" };

      (teamRepository.findById as jest.Mock).mockResolvedValue(null);
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);

      await expect(
        service.updateTeam(actingUser, companyId, teamId, updateDto)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ------------------- deleteTeam -------------------
  describe("deleteTeam", () => {
    it("deletes a team if user has permission", async () => {
      const actingUser = { id: "admin-user" } as User;
      const companyId = "company-id";
      const teamId = "team-id";
      const team = { id: teamId, companyId };

      (teamRepository.findById as jest.Mock).mockResolvedValue(team as any);
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);

      await service.deleteTeam(actingUser, companyId, teamId);

      expect(teamRepository.delete).toHaveBeenCalledWith(teamId);
      expect(rolePermissionService.checkPermission).toHaveBeenCalledWith(
        actingUser,
        "team:delete"
      );
    });

    it("throws ForbiddenError if user lacks permission", async () => {
      const actingUser = { id: "user" } as User;
      const companyId = "company-id";
      const teamId = "team-id";
      const team = { id: teamId, companyId };

      (teamRepository.findById as jest.Mock).mockResolvedValue(team as any);
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(false);

      await expect(
        service.deleteTeam(actingUser, companyId, teamId)
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError if team not found", async () => {
      const actingUser = { id: "admin-user" } as User;
      const companyId = "company-id";
      const teamId = "missing-id";

      (teamRepository.findById as jest.Mock).mockResolvedValue(null);
      (rolePermissionService.checkPermission as jest.Mock).mockResolvedValue(true);

      await expect(
        service.deleteTeam(actingUser, companyId, teamId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
