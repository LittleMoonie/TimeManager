import { validate } from 'class-validator';
import { Inject, Service } from 'typedi';

import { AddTeamMemberDto, CreateTeamDto, UpdateTeamDto } from '../../Dtos/Companies/CompanyDto';
import { Team } from '../../Entities/Companies/Team';
import { TeamMember } from '../../Entities/Companies/TeamMember';
import User from '../../Entities/Users/User';
import { ForbiddenError, NotFoundError, UnprocessableEntityError } from '../../Errors/HttpErrors';
import { TeamMemberRepository } from '../../Repositories/Companies/TeamMemberRepository';
import { TeamRepository } from '../../Repositories/Companies/TeamRepository';
import { RolePermissionService } from '../../Services/RoleService/RolePermissionService';

/**
 * @description Service layer for managing Team and TeamMember entities. This service provides business logic
 * for team-related operations, including CRUD for teams and managing team members, with integrated permission checks.
 */
@Service()
export class TeamService {
  /**
   * @description Initializes the TeamService with necessary repositories and services.
   * @param teamRepository The repository for Team entities.
   * @param teamMemberRepository The repository for TeamMember entities.
   * @param rolePermissionService The service for checking user permissions.
   */
  constructor(
    @Inject('TeamRepository') private readonly teamRepository: TeamRepository,
    @Inject('TeamMemberRepository') private readonly teamMemberRepository: TeamMemberRepository,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  /**
   * @description Ensures that a given DTO (Data Transfer Object) is valid by performing class-validator validation.
   * @param dto The DTO object to validate.
   * @returns A Promise that resolves if validation passes.
   * @throws {UnprocessableEntityError} If validation fails, containing details of the validation errors.
   */
  private async ensureValidation(dto: unknown) {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(', ')}`,
      );
    }
  }

  /**
   * @description Gets a team by its ID.
   * @param companyId The unique identifier of the company.
   * @param teamId The unique identifier of the team.
   * @returns A Promise that resolves to the Team entity.
   * @throws {NotFoundError} If the team is not found or does not belong to the specified company.
   */
  async getTeamById(companyId: string, teamId: string): Promise<Team> {
    const team = await this.teamRepository.findById(teamId);
    if (!team || team.companyId !== companyId) {
      throw new NotFoundError('Team not found');
    }
    return team;
  }

  /**
   * @description Retrieves a team by its ID, ensuring it belongs to the specified company.
   * @param companyId The unique identifier of the company.
   * @param teamId The unique identifier of the team.
   * @returns A Promise that resolves to the Team entity.
   * @throws {NotFoundError} If the team is not found or does not belong to the specified company.
   */
  private async getTeamScoped(companyId: string, teamId: string): Promise<Team> {
    const team = await this.teamRepository.findById(teamId);
    if (!team || team.companyId !== companyId) {
      throw new NotFoundError('Team not found');
    }
    return team;
  }

  // -------- Teams -------------------------------------------------------------

  /**
   * @description Lists all teams for a given company.
   * @param companyId The unique identifier of the company.
   * @param _actingUser The user performing the action (used for permission checks, but not directly in this method).
   * @returns {Promise<Team[]>} A Promise that resolves to an array of Team entities.
   */
  async listTeams(companyId: string): Promise<Team[]> {
    return this.teamRepository.findAllInCompany(companyId);
  }

  /**
   * @description Creates a new team within a specified company.
   * Requires 'create_team' permission.
   * @param companyId The unique identifier of the company where the team will be created.
   * @param actingUser The user performing the action.
   * @param dto The CreateTeamDto containing the new team's name.
   * @returns A Promise that resolves to the newly created Team entity.
   * @throws {ForbiddenError} If the acting user does not have 'create_team' permission.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   */
  async createTeam(companyId: string, actingUser: User, dto: CreateTeamDto): Promise<Team> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, 'create_team'))) {
      throw new ForbiddenError('User does not have permission to create teams.');
    }
    await this.ensureValidation(dto);

    return this.teamRepository.create({ companyId, name: dto.name } as Team);
  }

  /**
   * @description Updates an existing team within a specified company.
   * Requires 'update_team' permission.
   * @param companyId The unique identifier of the company the team belongs to.
   * @param actingUser The user performing the action.
   * @param teamId The unique identifier of the team to update.
   * @param dto The UpdateTeamDto containing the updated team data.
   * @returns A Promise that resolves to the updated Team entity.
   * @throws {ForbiddenError} If the acting user does not have 'update_team' permission.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   * @throws {NotFoundError} If the team is not found or does not belong to the specified company.
   */
  async updateTeam(
    companyId: string,
    actingUser: User,
    teamId: string,
    dto: UpdateTeamDto,
  ): Promise<Team> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, 'update_team'))) {
      throw new ForbiddenError('User does not have permission to update teams.');
    }
    await this.ensureValidation(dto);
    await this.getTeamScoped(companyId, teamId);

    return (await this.teamRepository.update(teamId, dto))!;
  }

  /**
   * @description Soft deletes a team within a specified company.
   * Requires 'delete_team' permission.
   * @param companyId The unique identifier of the company the team belongs to.
   * @param actingUser The user performing the action.
   * @param teamId The unique identifier of the team to delete.
   * @returns A Promise that resolves when the deletion is complete.
   * @throws {ForbiddenError} If the acting user does not have 'delete_team' permission.
   * @throws {NotFoundError} If the team is not found or does not belong to the specified company.
   */
  async deleteTeam(companyId: string, actingUser: User, teamId: string): Promise<void> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, 'delete_team'))) {
      throw new ForbiddenError('User does not have permission to delete teams.');
    }
    await this.getTeamScoped(companyId, teamId);
    await this.teamRepository.softDelete(teamId);
  }

  // -------- Team Members ------------------------------------------------------

  /**
   * @description Lists all members of a specific team within a given company.
   * @param companyId The unique identifier of the company.
   * @param teamId The unique identifier of the team.
   * @param _actingUser The user performing the action (used for permission checks, but not directly in this method).
   * @returns {Promise<TeamMember[]>} A Promise that resolves to an array of TeamMember entities.
   * @throws {NotFoundError} If the team is not found or does not belong to the specified company.
   */
  async listMembers(companyId: string, teamId: string): Promise<TeamMember[]> {
    await this.getTeamScoped(companyId, teamId);
    return this.teamMemberRepository.findAllForTeam(companyId, teamId);
  }

  /**
   * @description Adds a member to a team within a specified company. If the member already exists, their role will be updated if changed.
   * Requires 'manage_team_members' permission.
   * @param companyId The unique identifier of the company.
   * @param teamId The unique identifier of the team to add the member to.
   * @param actingUser The user performing the action.
   * @param dto The AddTeamMemberDto containing the user ID and role for the new member.
   * @returns A Promise that resolves to the created or updated TeamMember entity.
   * @throws {ForbiddenError} If the acting user does not have 'manage_team_members' permission.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   * @throws {NotFoundError} If the team is not found or does not belong to the specified company.
   */
  async addMember(
    companyId: string,
    teamId: string,
    actingUser: User,
    dto: AddTeamMemberDto,
  ): Promise<TeamMember> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, 'manage_team_members'))) {
      throw new ForbiddenError('User does not have permission to manage team members.');
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
        return (await this.teamMemberRepository.update(existing.id, {
          role: dto.role,
        }))!;
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

  /**
   * @description Removes a member from a team within a specified company.
   * Requires 'manage_team_members' permission.
   * @param companyId The unique identifier of the company.
   * @param teamId The unique identifier of the team to remove the member from.
   * @param actingUser The user performing the action.
   * @param userId The unique identifier of the user to remove from the team.
   * @returns A Promise that resolves when the removal is complete.
   * @throws {ForbiddenError} If the acting user does not have 'manage_team_members' permission.
   * @throws {NotFoundError} If the team is not found or does not belong to the specified company.
   */
  async removeMember(
    companyId: string,
    teamId: string,
    actingUser: User,
    userId: string,
  ): Promise<void> {
    if (!(await this.rolePermissionService.checkPermission(actingUser, 'manage_team_members'))) {
      throw new ForbiddenError('User does not have permission to manage team members.');
    }
    await this.getTeamScoped(companyId, teamId);

    const tm = await this.teamMemberRepository.findByTeamAndUser(companyId, teamId, userId);
    if (!tm) return; // idempotent
    await this.teamMemberRepository.delete(tm.id);
  }
}
