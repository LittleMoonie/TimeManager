import request from "supertest";
import { Express } from "express";
import { Container } from "typedi";
import { createTestApp } from "../../TestHelper";
import { TeamService } from "../../../Services/Company/TeamService";
import { UserService } from "../../../Services/User/UserService";
import { sign } from "jsonwebtoken";
import { TeamResponseDto } from "../../../Dtos/Company/TeamDto";
import { Team } from "@Entities/Companies/Team";

// ---- Mock the services ----
jest.mock("../../../Services/Company/TeamService");
jest.mock("../../../Services/User/UserService");

const generateToken = (payload: object) =>
  sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1h",
  });

describe("TeamController", () => {
  let app: Express;
  let teamService: jest.Mocked<TeamService>;
  let userService: jest.Mocked<UserService>;

  beforeAll(async () => {
    // Create a clean express app for this suite
    app = (await createTestApp()) as Express;
  });

  beforeEach(() => {
    teamService = {
      createTeam: jest.fn(),
      getTeamById: jest.fn(),
      getAllTeams: jest.fn(),
      updateTeam: jest.fn(),
      deleteTeam: jest.fn(),
    } as any;

    userService = {
      getUserById: jest.fn(),
    } as any;

    // Inject mocks into typedi container
    Container.set(TeamService, teamService);
    Container.set(UserService, userService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Container.reset();
  });

  // ---- POST /api/teams ----
  describe("POST /api/teams", () => {
    it("returns 200 OK and the created team for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const createDto = { name: "New Team" };
      const responseDto: TeamResponseDto = {
        id: "team-id",
        ...createDto,
      } as any;

      userService.getUserById.mockResolvedValue(adminUser as any);
      teamService.createTeam.mockResolvedValue(responseDto as Team);

      const response = await request(app)
        .post("/api/teams")
        .set("Authorization", `Bearer ${token}`)
        .send(createDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(teamService.createTeam).toHaveBeenCalledWith(adminUser, createDto);
    });
  });

  // ---- GET /api/teams/:id ----
  describe("GET /api/teams/:id", () => {
    it("returns 200 OK and the team data", async () => {
      const user = {
        id: "test-user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);
      const teamId = "team-id";
      const responseDto: TeamResponseDto = { id: teamId } as any;

      teamService.getTeamById.mockResolvedValue(responseDto as Team);

      const response = await request(app)
        .get(`/api/teams/${teamId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(teamService.getTeamById).toHaveBeenCalledWith(user.companyId, teamId);
    });
  });

  // ---- GET /api/teams ----
  describe("GET /api/teams", () => {
    it("returns 200 OK and an array of teams", async () => {
      const user = {
        id: "test-user-id",
        companyId: "test-company-id",
        roles: ["user"],
      };
      const token = generateToken(user);
      const responseDto: TeamResponseDto[] = [
        { id: "team-1" } as any,
        { id: "team-2" } as any,
      ];

      teamService.getAllTeams.mockResolvedValue(responseDto as Team[]);

      const response = await request(app)
        .get("/api/teams")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(teamService.getAllTeams).toHaveBeenCalledWith(user.companyId);
    });
  });

  // ---- PUT /api/teams/:id ----
  describe("PUT /api/teams/:id", () => {
    it("returns 200 OK and the updated team for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const teamId = "team-id";
      const updateDto = { name: "Updated Team" };
      const responseDto: TeamResponseDto = { id: teamId, ...updateDto } as any;

      userService.getUserById.mockResolvedValue(adminUser as any);
      teamService.updateTeam.mockResolvedValue(responseDto as Team);

      const response = await request(app)
        .put(`/api/teams/${teamId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseDto);
      expect(teamService.updateTeam).toHaveBeenCalledWith(
        adminUser,
        teamId,
        updateDto
      );
    });
  });

  // ---- DELETE /api/teams/:id ----
  describe("DELETE /api/teams/:id", () => {
    it("returns 204 No Content on successful deletion for admin users", async () => {
      const adminUser = {
        id: "admin-user-id",
        companyId: "test-company-id",
        roles: ["admin"],
      };
      const token = generateToken(adminUser);
      const teamId = "team-id";

      userService.getUserById.mockResolvedValue(adminUser as any);
      teamService.deleteTeam.mockResolvedValue();

      const response = await request(app)
        .delete(`/api/teams/${teamId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);
      expect(teamService.deleteTeam).toHaveBeenCalledWith(adminUser, teamId);
    });
  });
});
