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
import { AuthenticationError } from "../../Errors/HttpErrors";
import { UserService } from "../../Services/User/UserService";
import { Service } from "typedi";

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

  @Post("/")
  @Security("jwt", ["admin", "manager"])
  public async createTeam(
    @Body() createTeamDto: CreateTeamDto,
    @Request() request: ExpressRequest,
  ): Promise<TeamResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
    const actingUser = await this.userService.getUserById(companyId, userId);

    const team = await this.teamService.createTeam(
      actingUser,
      companyId,
      createTeamDto,
    );
    return team;
  }

  @Get("/{id}")
  public async getTeam(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<TeamResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    return this.teamService.getTeamById(companyId, id);
  }

  @Get("/")
  public async getAllTeams(
    @Request() request: ExpressRequest,
  ): Promise<TeamResponseDto[]> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { companyId } = request.user;
    return this.teamService.getAllTeams(companyId);
  }

  @Put("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async updateTeam(
    @Path() id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Request() request: ExpressRequest,
  ): Promise<TeamResponseDto> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
    const actingUser = await this.userService.getUserById(companyId, userId);

    const updatedTeam = await this.teamService.updateTeam(
      actingUser,
      companyId,
      id,
      updateTeamDto,
    );
    return updatedTeam;
  }

  @Delete("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async deleteTeam(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    if (!request.user) {
      throw new AuthenticationError("User not authenticated");
    }
    const { id: userId, companyId } = request.user;
    const actingUser = await this.userService.getUserById(companyId, userId);

    await this.teamService.deleteTeam(actingUser, companyId, id);
  }
}
