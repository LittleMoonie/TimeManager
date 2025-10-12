import { IsNotEmpty, IsString, IsOptional, IsUUID } from "class-validator";

/**
 * @summary Data transfer object for creating a new team.
 */
export class CreateTeamDto {
  /**
   * @description The name of the team.
   * @example "Development Team"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;
}

/**
 * @summary Data transfer object for updating an existing team.
 */
export class UpdateTeamDto {
  /**
   * @description Optional: The updated name of the team.
   * @example "Frontend Team"
   */
  @IsString()
  @IsOptional()
  name?: string;
}

/**
 * @summary Data transfer object for a team response.
 */
export class TeamResponseDto {
  /**
   * @description The unique identifier of the team.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  id!: string;
  /**
   * @description The name of the team.
   * @example "Development Team"
   */
  name!: string;
  /**
   * @description The ID of the company to which the team belongs.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  companyId!: string;
}

/**
 * @summary Data transfer object for adding a member to a team.
 */
export class AddTeamMemberDto {
  /**
   * @description The ID of the user to add to the team.
   * @example "1a2b3c4d-5e6f-7890-abcd-ef1234567890"
   */
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  /**
   * @description The role of the user within the team.
   * @example "Developer"
   */
  @IsString()
  @IsNotEmpty()
  role!: string;
}

/**
 * @summary Data transfer object for a team member response.
 */
export class TeamMemberResponseDto {
  /**
   * @description The unique identifier of the team member entry.
   * @example "2b3c4d5e-6f7a-8901-bcde-f1234567890a"
   */
  id!: string;
  /**
   * @description The ID of the team the member belongs to.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  teamId!: string;
  /**
   * @description The ID of the user who is a member of the team.
   * @example "1a2b3c4d-5e6f-7890-abcd-ef1234567890"
   */
  userId!: string;
  /**
   * @description The role of the user within the team.
   * @example "Developer"
   */
  role!: string;
}
