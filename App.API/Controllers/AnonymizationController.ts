import { Controller, Delete, Path, Request, Route, Security, Tags } from "tsoa";
import { AnonymizationService } from "../../Services/AnonymizationService";
import { Service } from "typedi";
import { Request as ExpressRequest } from "express";

@Service()
@Route("anonymization")
@Tags("Anonymization")
@Security("jwt")
export class AnonymizationController extends Controller {
  constructor(private anonymizationService: AnonymizationService) {
    super();
  }

  /**
   * @summary Anonymizes a user's data and removes sensitive information.
   * @description This is a permanent and irreversible action.
   * @param {string} userId - The ID of the user to anonymize.
   * @param {ExpressRequest} request - The Express request object.
   * @returns {Promise<void>}
   */
  @Delete("/{userId}")
  @Security("jwt", ["admin"])
  public async anonymizeUser(
    @Path() userId: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    await this.anonymizationService.anonymizeUserData(userId);
  }
}
