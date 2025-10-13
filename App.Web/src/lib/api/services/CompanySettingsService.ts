/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompanySettings } from '../models/CompanySettings';
import type { UpdateCompanySettingsDto } from '../models/UpdateCompanySettingsDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CompanySettingsService {
  /**
   * Retrieves the company settings for the authenticated user's company.
   * @returns CompanySettings The company settings.
   * @throws ApiError
   */
  public static getCompanySettings(): CancelablePromise<CompanySettings> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/company-settings',
    });
  }
  /**
   * Updates the company settings for the authenticated user's company.
   * @returns CompanySettings The updated company settings.
   * @throws ApiError
   */
  public static updateCompanySettings({
    requestBody,
  }: {
    /**
     * The data for updating the company settings.
     */
    requestBody: UpdateCompanySettingsDto;
  }): CancelablePromise<CompanySettings> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/company-settings',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Deletes the company settings for the authenticated user's company.
   * @returns void
   * @throws ApiError
   */
  public static deleteCompanySettings(): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/company-settings',
    });
  }
}
