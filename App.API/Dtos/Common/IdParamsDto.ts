import { IsUUID } from "class-validator";

/**
 * @description Data transfer object for path parameters that contain a single UUID identifier.
 */
export class UuidParamDto {
  /**
   * @description The unique identifier (UUID) of the resource, provided as a path parameter.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsUUID()
  id!: string;
}
