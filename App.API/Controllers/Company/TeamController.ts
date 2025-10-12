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
import { TeamService } from "../../Services/Company/TeamService";
import {
  CreateTeamDto,
  TeamResponseDto,
  UpdateTeamDto,
} from "../../Dtos/Company/TeamDto";
import { UserService } from "../../Services/User/UserService";
import { Service } from "typedi";
import { UserDto } from "../../Dtos/Users/UserDto";

/**
 * @summary Controller for managing teams within a company.
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
   * @param {CreateTeamDto} createTeamDto - The data for creating the team.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<TeamResponseDto>} The newly created team.
   */
  @Post("/")
  @Security("jwt", ["admin", "manager"])
  public async createTeam(
    @Body() createTeamDto: CreateTeamDto,
    @Request() request: ExpressRequest,
  ): Promise<TeamResponseDto> {
    const { id: userId } = request.user as UserDto;
    const actingUser = await this.userService.getUserById(userId);

    const team = await this.teamService.createTeam(
      actingUser,
      actingUser.companyId,
      createTeamDto,
    );
    return team;
  }

  /**
   * @summary Retrieves a single team by its ID.
   * @param {string} id - The ID of the team to retrieve.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<TeamResponseDto>} The team details.
   */
  @Get("/{id}")
  public async getTeam(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<TeamResponseDto> {
    const { id: userId } = request.user as UserDto;
    const actingUser = await this.userService.getUserById(userId);
    return this.teamService.getTeamById(actingUser.companyId, id);
  }

  /**
   * @summary Retrieves all teams for the authenticated user's company.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<TeamResponseDto[]>} An array of teams.
   */
  @Get("/")
  public async getAllTeams(
    @Request() request: ExpressRequest,
  ): Promise<TeamResponseDto[]> {
    const { id: userId } = request.user as UserDto;
    const actingUser = await this.userService.getUserById(userId);
    return this.teamService.getAllTeams(actingUser.companyId);
  }

  /**
   * @summary Updates an existing team.
   * @param {string} id - The ID of the team to update.
   * @param {UpdateTeamDto} updateTeamDto - The data for updating the team.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<TeamResponseDto>} The updated team details.
   */
  @Put("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async updateTeam(
    @Path() id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Request() request: ExpressRequest,
  ): Promise<TeamResponseDto> {
    const { id: userId } = request.user as UserDto;
    const actingUser = await this.userService.getUserById(userId);

    const updatedTeam = await this.teamService.updateTeam(
      actingUser,
      actingUser.companyId,
      id,
      updateTeamDto,
    );
    return updatedTeam;
  }

  /**
   * @summary Deletes a team by its ID.
   * @param {string} id - The ID of the team to delete.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<void>} Nothing is returned upon successful deletion.
   */
  @Delete("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async deleteTeam(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const { id: userId } = request.user as UserDto;
    const actingUser = await this.userService.getUserById(userId);

    await this.teamService.deleteTeam(actingUser, actingUser.companyId, id);
  }
}
