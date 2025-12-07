/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CountriesService {
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static listCountries(): CancelablePromise<Array<{
        hasOffice: boolean;
        name: string;
        code: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/company/countries',
        });
    }
}
