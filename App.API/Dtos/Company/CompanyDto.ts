import { IsNotEmpty, IsString, IsOptional } from "class-validator";

/**
 * @summary Data transfer object for creating a new company.
 */
export class CreateCompanyDto {
  /**
   * @description The name of the company.
   * @example "Acme Corporation"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * @description Optional: The timezone of the company.
   * @example "America/New_York"
   */
  @IsString()
  @IsOptional()
  timezone?: string;
}

/**
 * @summary Data transfer object for updating an existing company.
 */
export class UpdateCompanyDto {
  /**
   * @description Optional: The updated name of the company.
   * @example "Acme Inc."
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * @description Optional: The updated timezone of the company.
   * @example "Europe/London"
   */
  @IsString()
  @IsOptional()
  timezone?: string;
}

/**
 * @summary Data transfer object for a company response.
 */
export class CompanyResponseDto {
  /**
   * @description The unique identifier of the company.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  id!: string;
  /**
   * @description The name of the company.
   * @example "Acme Corporation"
   */
  name!: string;
  /**
   * @description Optional: The timezone of the company.
   * @example "America/New_York"
   */
  timezone?: string;
}
