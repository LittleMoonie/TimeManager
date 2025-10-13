/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AnonymizationService {
  /**
   * Anonymizes a user's data and removes sensitive information. This is a permanent and irreversible action.
   * @returns void
   * @throws ApiError
   */
  public static anonymizeUser({
    userId,
  }: {
    /**
     * The ID of the user to anonymize.
     */
    userId: string;
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/anonymization/{userId}',
      path: {
        userId: userId,
      },
    });
  }
}
