import { Controller, Delete, Path, Request, Route, Security, Tags, SuccessResponse } from 'tsoa';
import { AnonymizationService } from '../../Services/Users/AnonymizationService';
import { Service } from 'typedi';
import { Request as ExpressRequest } from 'express';

/**
 * @summary Controller for managing user anonymization.
 * @tags Anonymization
 * @security jwt
 */
@Tags('Anonymization')
@Security('jwt')
@Service()
export class AnonymizationController extends Controller {
  constructor(private anonymizationService: AnonymizationService) {
    super();
  }

  /**
   * @summary Anonymizes a user's data and removes sensitive information. This is a permanent and irreversible action.
   * @param userId The ID of the user to anonymize.
   * @param request The Express request object, containing user information.
   * @returns A Promise that resolves upon successful anonymization.
   * @throws {NotFoundError} If the user is not found or does not belong to the authenticated user's company.
   */
  @Delete('/{userId}')
  @Security('jwt', ['admin'])
  @SuccessResponse(204, 'User anonymized')
  public async anonymizeUser(
    @Path() userId: string,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const { companyId } = request.user as { companyId: string };
    await this.anonymizationService.anonymizeUserData(userId, companyId);
    this.setStatus(204);
  }
}
