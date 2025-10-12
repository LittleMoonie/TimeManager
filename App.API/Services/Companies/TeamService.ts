import { Service } from "typedi";
import { validate } from "class-validator";

import { TeamRepository } from "@/Repositories/Companies/TeamRepository";
import { TeamMemberRepository } from "@/Repositories/Companies/TeamMemberRepository";
import { Team, TeamMember } from "@/Entities/Companies/Team";
import { ForbiddenError, NotFoundError, UnprocessableEntityError } from "@/Errors/HttpErrors";
import User from "@/Entities/Users/User";
import {
  AddTeamMemberDto,
  CreateTeamDto,
  UpdateTeamDto,
} from "@/Dtos/Companies/CompanyDto";
import { RolePermissionService } from "@/Services/RoleService/RolePermissionService";

@Service()
export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly teamMemberRepository: TeamMemberRepository,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map(e => e.toString()).join(", ")}`
      );
    }
  }

  private async getTeamScoped(companyId: string, teamId: string): Promise<Team> {
    const team = await this.teamRepository.findById(teamId);
    if (!team || team.companyId !== companyId) {
      throw new NotFoundError("Team not found");
    }
    return team;
  }

  // -------- Teams -------------------------------------------------------------

  async listTeams(companyId: string, _actingUser: User): Promise<Team[]> {
    return this.teamRepository.findAll(companyId);
  }

  async createTeam(
    companyId: string,
    actingUser: User,
    dto: CreateTeamDto,
  ): Promise<Team> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, "create_team"))) {
      throw new ForbiddenError("User does not have permission to create teams.");
    }
    await this.ensureValidation(dto);

    return this.teamRepository.create({ companyId, name: dto.name } as Team);
  }

  async updateTeam(
    companyId: string,
    actingUser: User,
    teamId: string,
    dto: UpdateTeamDto,
  ): Promise<Team> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, "update_team"))) {
      throw new ForbiddenError("User does not have permission to update teams.");
    }
    await this.ensureValidation(dto);
    await this.getTeamScoped(companyId, teamId);

    return (await this.teamRepository.update(teamId, dto))!;
  }

  async deleteTeam(
    companyId: string,
    actingUser: User,
    teamId: string,
  ): Promise<void> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, "delete_team"))) {
      throw new ForbiddenError("User does not have permission to delete teams.");
    }
    await this.getTeamScoped(companyId, teamId);
    await this.teamRepository.softDelete(teamId);
  }

  // -------- Team Members ------------------------------------------------------

  async listMembers(
    companyId: string,
    teamId: string,
    _actingUser: User,
  ): Promise<TeamMember[]> {
    await this.getTeamScoped(companyId, teamId);
    return this.teamMemberRepository.findAllForTeam(companyId, teamId);
  }

  async addMember(
    companyId: string,
    teamId: string,
    actingUser: User,
    dto: AddTeamMemberDto,
  ): Promise<TeamMember> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, "manage_team_members"))) {
      throw new ForbiddenError("User does not have permission to manage team members.");
    }
    await this.ensureValidation(dto);
    await this.getTeamScoped(companyId, teamId);

    // Idempotent: if exists, update role when changed.
    const existing = await this.teamMemberRepository.findByTeamAndUser(
      companyId,
      teamId,
      dto.userId,
    );
    if (existing) {
      if (dto.role && dto.role !== existing.role) {
        return (await this.teamMemberRepository.update(existing.id, { role: dto.role }))!;
      }
      return existing;
    }

    return this.teamMemberRepository.create({
      companyId,
      teamId,
      userId: dto.userId,
      role: dto.role,
    } as TeamMember);
  }

  async removeMember(
    companyId: string,
    teamId: string,
    actingUser: User,
    userId: string,
  ): Promise<void> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, "manage_team_members"))) {
      throw new ForbiddenError("User does not have permission to manage team members.");
    }
    await this.getTeamScoped(companyId, teamId);

    const tm = await this.teamMemberRepository.findByTeamAndUser(
      companyId,
      teamId,
      userId,
    );
    if (!tm) return; // idempotent
    await this.teamMemberRepository.delete(tm.id);
  }
}
