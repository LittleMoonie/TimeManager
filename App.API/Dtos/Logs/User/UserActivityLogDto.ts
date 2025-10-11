import { IsNotEmpty, IsOptional, IsEnum, IsUUID } from "class-validator";
import { UserActivityType } from "../../../Entities/Logs/Users/UserActivityLog";

export class CreateUserActivityLogDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsEnum(UserActivityType)
  @IsNotEmpty()
  activityType!: UserActivityType;

  @IsUUID()
  @IsOptional()
  targetId?: string;

  @IsOptional()
  details?: Record<string, string>;
}

export class UserActivityLogResponseDto {
  id!: string;
  userId!: string;
  activityType!: UserActivityType;
  targetId?: string;
  details?: Record<string, string>;
  createdAt!: Date;
}
