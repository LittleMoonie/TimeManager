import { IsNotEmpty, IsString } from "class-validator";

/**
 * @summary Data transfer object for creating a new action code.
 */
export class CreateActionCodeDto {
  /**
   * @description The name of the action code.
   * @example "Meeting"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * @description The unique code for the action.
   * @example "MEET"
   */
  @IsString()
  @IsNotEmpty()
  code!: string;
}

/**
 * @summary Data transfer object for updating an existing action code.
 */
export class UpdateActionCodeDto {
  /**
   * @description The updated name of the action code.
   * @example "Client Meeting"
   */
  @IsString()
  @IsNotEmpty()
  name!: string;

  /**
   * @description The updated unique code for the action.
   * @example "CLMT"
   */
  @IsString()
  @IsNotEmpty()
  code!: string;
}
