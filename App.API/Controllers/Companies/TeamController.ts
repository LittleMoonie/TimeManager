import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Route,
  Tags,
  Path,
  Security,
  Request,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { Service } from "typedi";

import { TeamService } from "../../Services/Companies/TeamService";
import { CreateTeamDto, UpdateTeamDto } from "../../Dtos/Companies/CompanyDto";
import { Team } from "../../Entities/Companies/Team";
import { UserService } from "../../Services/Users/UserService";
import { UserResponseDto } from "../../Dtos/Users/UserResponseDto";
import User from "Entities/Users/User";

/**
 * @summary Controller for managing teams.
 * @tags Teams
 * @security jwt
 */
@Route("teams")
@Tags("Teams")
@Security("jwt")
@Service()
export class TeamController extends Controller {
  constructor(
    private teamService: TeamService,
    private userService: UserService,
  ) {
    super();
  }

  /**
   * @summary Creates a new team.
   * @param createTeamDto The data for creating the team.
   * @param request The Express request object, containing user information.
   * @returns The newly created team.
   * @throws {ForbiddenError} If the acting user does not have permission to create teams.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   */
  @Post("/")
  @Security("jwt", ["admin", "manager"])
  public async createTeam(
    @Body() createTeamDto: CreateTeamDto,
    @Request() request: ExpressRequest,
  ): Promise<Team> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(
      userId,
      userId,
      request.user as User,
    );
    return this.teamService.createTeam(
      actingUser.companyId,
      actingUser as User,
      createTeamDto,
    );
  }

  /**
   * @summary Retrieves a single team by its ID.
   * @param id The ID of the team to retrieve.
   * @param request The Express request object, containing user information.
   * @returns The team details.
   * @throws {NotFoundError} If the team is not found or does not belong to the specified company.
   */
  @Get("/{id}")
  public async getTeam(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Team> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(
      userId,
      userId,
      request.user as User,
    );
    return this.teamService.getTeamById(actingUser.companyId, id);
  }

  /**
   * @summary Retrieves all teams for the authenticated user's company.
   * @param request The Express request object, containing user information.
   * @returns An array of teams.
   */
  @Get("/")
  public async getAllTeams(
    @Request() request: ExpressRequest,
  ): Promise<Team[]> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(
      userId,
      userId,
      request.user as User,
    );
    return this.teamService.listTeams(actingUser.companyId);
  }

  /**
   * @summary Updates an existing team.
   * @param id The ID of the team to update.
   * @param updateTeamDto The data for updating the team.
   * @param request The Express request object, containing user information.
   * @returns The updated team details.
   * @throws {ForbiddenError} If the acting user does not have permission to update teams.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   * @throws {NotFoundError} If the team is not found or does not belong to the specified company.
   */
  @Put("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async updateTeam(
    @Path() id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Request() request: ExpressRequest,
  ): Promise<Team> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(
      userId,
      userId,
      request.user as User,
    );
    return this.teamService.updateTeam(
      actingUser.companyId,
      actingUser as User,
      id,
      updateTeamDto,
    );
  }

  /**
   * @summary Deletes a team by its ID.
   * @param id The ID of the team to delete.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves upon successful deletion.
   * @throws {ForbiddenError} If the acting user does not have permission to delete teams.
   * @throws {NotFoundError} If the team is not found or does not belong to the specified company.
   */
  @Delete("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async deleteTeam(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(
      userId,
      userId,
      request.user as User,
    );
    await this.teamService.deleteTeam(
      actingUser.companyId,
      actingUser as User,
      id,
    );
  }
}
