/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginDto } from '../models/LoginDto';
import type { RegisterDto } from '../models/RegisterDto';
import type { UserResponseDto } from '../models/UserResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
  /**
   * Registers a new user.
   * @returns UserResponseDto User registered successfully
   * @throws ApiError
   */
  public static register({
    requestBody,
  }: {
    /**
     * The registration details for the new user.
     */
    requestBody: RegisterDto;
  }): CancelablePromise<UserResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/auth/register',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Logs in a user and returns authentication tokens.
   * @returns any User logged in successfully
   * @throws ApiError
   */
  public static login({
    requestBody,
  }: {
    /**
     * The login credentials (email and password).
     */
    requestBody: LoginDto;
  }): CancelablePromise<{
    user: UserResponseDto;
    token: string;
  }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/auth/login',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Logs out the current user by revoking their refresh token.
   * @returns void
   * @throws ApiError
   */
  public static logout(): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/auth/logout',
    });
  }
  /**
   * Retrieves the profile of the currently authenticated user.
   * @returns UserResponseDto The authenticated user's profile.
   * @throws ApiError
   */
  public static getCurrentUser(): CancelablePromise<UserResponseDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/auth/current',
    });
  }
}
