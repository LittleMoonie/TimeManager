import { IsUUID } from "class-validator";

/** @summary Path param DTO with a single UUID id. */
export class UuidParamDto {
  /** @description Resource id path parameter. */
  @IsUUID()
  id!: string;
}
