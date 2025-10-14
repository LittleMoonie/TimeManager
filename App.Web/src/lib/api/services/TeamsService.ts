/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTeamDto } from '../models/CreateTeamDto';
import type { Team } from '../models/Team';
import type { UpdateTeamDto } from '../models/UpdateTeamDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TeamsService {
  /**
   * Creates a new team.
   * @returns Team The newly created team.
   * @throws ApiError
   */
  public static createTeam({
    requestBody,
  }: {
    /**
     * The data for creating the team.
     */
    requestBody: CreateTeamDto;
  }): CancelablePromise<Team> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/teams',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Retrieves all teams for the authenticated user's company.
   * @returns Team An array of teams.
   * @throws ApiError
   */
  public static getAllTeams(): CancelablePromise<Array<Team>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/teams',
    });
  }
  /**
   * Retrieves a single team by its ID.
   * @returns Team The team details.
   * @throws ApiError
   */
  public static getTeam({
    id,
  }: {
    /**
     * The ID of the team to retrieve.
     */
    id: string;
  }): CancelablePromise<Team> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/teams/{id}',
      path: {
        id: id,
      },
    });
  }
  /**
   * Updates an existing team.
   * @returns Team The updated team details.
   * @throws ApiError
   */
  public static updateTeam({
    id,
    requestBody,
  }: {
    /**
     * The ID of the team to update.
     */
    id: string;
    /**
     * The data for updating the team.
     */
    requestBody: UpdateTeamDto;
  }): CancelablePromise<Team> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/teams/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Deletes a team by its ID.
   * @returns void
   * @throws ApiError
   */
  public static deleteTeam({
    id,
  }: {
    /**
     * The ID of the team to delete.
     */
    id: string;
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/teams/{id}',
      path: {
        id: id,
      },
    });
  }
}
