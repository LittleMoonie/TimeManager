import {
  Body, Controller, Get, Post, Put, Delete, Route, Tags, Path, Security, Request,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { Service } from "typedi";

import { TeamService } from "@/Services/Companies/TeamService";
import { CreateTeamDto, UpdateTeamDto } from "@/Dtos/Companies/CompanyDto";
import { Team } from "@/Entities/Companies/Team";
import { UserService } from "@/Services/User/UserService";
import { UserResponseDto } from "@/Dtos/Users/UserResponseDto";

/**
 * @summary Manage teams
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

  /** Create */
  @Post("/")
  @Security("jwt", ["admin", "manager"])
  public async createTeam(
    @Body() createTeamDto: CreateTeamDto,
    @Request() request: ExpressRequest,
  ): Promise<Team> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(userId);
    return this.teamService.createTeam(
      actingUser.companyId,
      actingUser,
      createTeamDto,
    );
  }

  /** Get one */
  @Get("/{id}")
  public async getTeam(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<Team> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(userId);
    return this.teamService.getTeamById(actingUser.companyId, id);
  }

  /** List */
  @Get("/")
  public async getAllTeams(
    @Request() request: ExpressRequest,
  ): Promise<Team[]> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(userId);
    return this.teamService.listTeams(actingUser.companyId, actingUser);
  }

  /** Update */
  @Put("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async updateTeam(
    @Path() id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Request() request: ExpressRequest,
  ): Promise<Team> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(userId);
    return this.teamService.updateTeam(
      actingUser.companyId,
      actingUser,
      id,
      updateTeamDto,
    );
  }

  /** Delete */
  @Delete("/{id}")
  @Security("jwt", ["admin", "manager"])
  public async deleteTeam(
    @Path() id: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const { id: userId } = request.user as UserResponseDto;
    const actingUser = await this.userService.getUserById(userId);
    await this.teamService.deleteTeam(actingUser.companyId, actingUser, id);
  }
}
