import { Service } from "typedi";
import { TeamRepository } from "../../Repositories/Companies/TeamRepository";
import { CreateTeamDto, UpdateTeamDto } from "../../Dtos/Company/TeamDto";
import { Team } from "../../Entities/Companies/Team";
import { NotFoundError, ForbiddenError } from "../../Errors/HttpErrors";
import User from "../../Entities/Users/User";
import { RolePermissionService } from "../User/RolePermissionService";

@Service()
export class TeamService {
  constructor(
    private teamRepository: TeamRepository,
    private rolePermissionService: RolePermissionService,
  ) {}

  public async createTeam(
    actingUser: User,
    companyId: string,
    createTeamDto: CreateTeamDto,
  ): Promise<Team> {
    // Permission check: Only users with 'create_team' permission can create a team
    if (
      !(await this.rolePermissionService.checkPermission(
        actingUser,
        "create_team",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to create teams.",
      );
    }
    return this.teamRepository.create({ companyId, ...createTeamDto });
  }

  public async getTeamById(companyId: string, teamId: string): Promise<Team> {
    const team = await this.teamRepository.findById(teamId);
    if (!team || team.companyId !== companyId) {
      throw new NotFoundError("Team not found");
    }
    return team;
  }

  public async getAllTeams(companyId: string): Promise<Team[]> {
    return this.teamRepository.findAll(companyId);
  }

  public async updateTeam(
    actingUser: User,
    companyId: string,
    teamId: string,
    updateTeamDto: UpdateTeamDto,
  ): Promise<Team> {
    // Permission check: Only users with 'update_team' permission can update a team
    if (
      !(await this.rolePermissionService.checkPermission(
        actingUser,
        "update_team",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to update teams.",
      );
    }
    const team = await this.getTeamById(companyId, teamId);
    if (team.companyId !== companyId) {
      throw new ForbiddenError(
        "User does not have permission to update this team.",
      );
    }
    const updatedTeam = await this.teamRepository.update(teamId, updateTeamDto);
    return updatedTeam!;
  }

  public async deleteTeam(
    actingUser: User,
    companyId: string,
    teamId: string,
  ): Promise<void> {
    // Permission check: Only users with 'delete_team' permission can delete a team
    if (
      !(await this.rolePermissionService.checkPermission(
        actingUser,
        "delete_team",
      ))
    ) {
      throw new ForbiddenError(
        "User does not have permission to delete teams.",
      );
    }
    const team = await this.getTeamById(companyId, teamId);
    if (team.companyId !== companyId) {
      throw new ForbiddenError(
        "User does not have permission to delete this team.",
      );
    }
    await this.teamRepository.delete(teamId);
  }
}
