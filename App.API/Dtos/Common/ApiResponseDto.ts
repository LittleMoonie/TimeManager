/**
 * @description Data transfer object for a generic successful API response, typically containing a human-readable message.
 */
export class ApiResponseDto {
    /**
     * @description A human-readable message indicating the outcome of the operation.
     * @example "Operation successful"
     */
    message!: string;
  }
  
  /**
   * @description Data transfer object for a generic API error response, providing details about the error.
   */
  export class ApiErrorDto {
    /**
     * @description The name or type of the error.
     * @example "ValidationError"
     */
    error!: string;
    /**
     * @description A human-readable message describing the error.
     * @example "One or more validation errors occurred."
     */
    message!: string;
    /**
     * @description Optional: A record of field-level validation issues, where keys are field names and values are arrays of error messages.
     * @example { "email": ["Email is invalid"], "password": ["Password is too short"] }
     */
    details?: Record<string, string[]>;
  }
  