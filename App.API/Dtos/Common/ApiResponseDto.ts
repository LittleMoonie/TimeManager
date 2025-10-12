/**
 * @summary Generic success message.
 */
export class ApiResponseDto {
    /** @description Human-readable message. */
    message!: string;
  }
  
  /**
   * @summary Generic error response shape.
   */
  export class ApiErrorDto {
    /** @description Error name or type. */
    error!: string;
    /** @description Human-readable message. */
    message!: string;
    /** @description Optional field-level validation issues. */
    details?: Record<string, string[]>;
  }
  