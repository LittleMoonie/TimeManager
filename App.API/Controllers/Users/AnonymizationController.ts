import { Controller, Delete, Path, Request, Route, Security, Tags, SuccessResponse } from "tsoa";
import { AnonymizationService } from "../../Services/Users/AnonymizationService";
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
   * @summary Anonymizes a user's data and removes sensitive information (irreversible).
   */
  @Delete("/{userId}")
  @Security("jwt", ["admin"])
  @SuccessResponse(204, "User anonymized")
  public async anonymizeUser(
    @Path() userId: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const { companyId } = request.user as { companyId: string };
    await this.anonymizationService.anonymizeUserData(userId, companyId);
    this.setStatus(204);
  }
}
