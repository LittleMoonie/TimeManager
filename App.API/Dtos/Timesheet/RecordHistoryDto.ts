import {
  IsEnum,
  IsISO8601,
  IsJSON,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { DataLogAction } from "../../Entities/Logs/Data/DataLog";

/**
 * @summary Data transfer object for recording history entries.
 */
export class RecordHistoryDto {
  /**
   * @description The type of entity being recorded.
   * @example "Timesheet"
   */
  @IsEnum(DataLogAction)
  entityType!: DataLogAction;

  /**
   * @description The ID of the entity being recorded.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsUUID()
  entityId!: string;

  /**
   * @description The action performed on the entity.
   * @example "Update"
   */
  @IsEnum(DataLogAction)
  action!: DataLogAction;

  /**
   * @description The ID of the user who performed the action.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  @IsUUID()
  userId!: string;

  /**
   * @description Optional: The ID of the user who initiated the action (if different from userId).
   * @example "1a2b3c4d-5e6f-7890-abcd-ef1234567890"
   */
  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  /**
   * @description Optional: The status of the entity before the action.
   * @example "Pending"
   */
  @IsOptional()
  @IsString()
  fromStatus?: string;

  /**
   * @description Optional: The status of the entity after the action.
   * @example "Approved"
   */
  @IsOptional()
  @IsString()
  toStatus?: string;

  /**
   * @description Optional: A reason or comment for the action.
   * @example "Approved by manager"
   */
  @IsOptional()
  @IsString()
  reason?: string;

  /**
   * @description Optional: A JSON object representing the differences made to the entity.
   * @example { "oldValue": "value1", "newValue": "value2" }
   */
  @IsOptional()
  @IsJSON()
  diff?: Record<string, string>;

  /**
   * @description Optional: Additional metadata associated with the history record.
   * @example { "source": "web_app" }
   */
  @IsOptional()
  @IsJSON()
  metadata?: Record<string, string>;

  /**
   * @description Optional: The timestamp when the history record was created (ISO 8601 format).
   * @example "2023-10-27T10:00:00Z"
   */
  @IsOptional()
  @IsISO8601()
  createdAt?: string;

  /**
   * @description Optional: A hash of the history record for integrity checking.
   * @example "somehashvalue"
   */
  @IsOptional()
  @IsString()
  hash?: string;
}
