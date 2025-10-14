/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from '../models/Company';
import type { CreateCompanyDto } from '../models/CreateCompanyDto';
import type { UpdateCompanyDto } from '../models/UpdateCompanyDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CompaniesService {
    /**
     * Creates a new company.
     * @returns Company Company created successfully
     * @throws ApiError
     */
    public static createCompany({
        requestBody,
    }: {
        /**
         * The data for creating the company.
         */
        requestBody: CreateCompanyDto,
    }): CancelablePromise<Company> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/companies',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieves a company by its ID.
     * @returns Company The company details.
     * @throws ApiError
     */
    public static getCompany({
        id,
    }: {
        /**
         * The ID of the company to retrieve.
         */
        id: string,
    }): CancelablePromise<Company> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/companies/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Updates an existing company.
     * @returns Company The updated company details.
     * @throws ApiError
     */
    public static updateCompany({
        id,
        requestBody,
    }: {
        /**
         * The ID of the company to update.
         */
        id: string,
        /**
         * The data for updating the company.
         */
        requestBody: UpdateCompanyDto,
    }): CancelablePromise<Company> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/companies/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
