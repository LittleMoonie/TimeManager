/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateLeaveRequestDto } from '../models/CreateLeaveRequestDto';
import type { LeaveRequest } from '../models/LeaveRequest';
import type { UpdateLeaveRequestDto } from '../models/UpdateLeaveRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LeaveRequestsService {
  /**
   * Creates a new leave request.
   * @returns LeaveRequest The newly created leave request.
   * @throws ApiError
   */
  public static createLeaveRequest({
    requestBody,
  }: {
    /**
     * The data for creating the leave request.
     */
    requestBody: CreateLeaveRequestDto;
  }): CancelablePromise<LeaveRequest> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/leave-requests',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Retrieves all leave requests for the authenticated user's company.
   * @returns LeaveRequest An array of leave requests.
   * @throws ApiError
   */
  public static getAllLeaveRequests(): CancelablePromise<Array<LeaveRequest>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/leave-requests',
    });
  }
  /**
   * Retrieves a single leave request by its ID.
   * @returns LeaveRequest The leave request details.
   * @throws ApiError
   */
  public static getLeaveRequest({
    id,
  }: {
    /**
     * The ID of the leave request to retrieve.
     */
    id: string;
  }): CancelablePromise<LeaveRequest> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/leave-requests/{id}',
      path: {
        id: id,
      },
    });
  }
  /**
   * Updates an existing leave request.
   * @returns LeaveRequest The updated leave request details.
   * @throws ApiError
   */
  public static updateLeaveRequest({
    id,
    requestBody,
  }: {
    /**
     * The ID of the leave request to update.
     */
    id: string;
    /**
     * The data for updating the leave request.
     */
    requestBody: UpdateLeaveRequestDto;
  }): CancelablePromise<LeaveRequest> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/leave-requests/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Deletes a leave request by its ID.
   * @returns void
   * @throws ApiError
   */
  public static deleteLeaveRequest({
    id,
  }: {
    /**
     * The ID of the leave request to delete.
     */
    id: string;
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/leave-requests/{id}',
      path: {
        id: id,
      },
    });
  }
}
