import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
} from "class-validator";
import {
  LeaveRequestStatus,
  LeaveType,
} from "../../Entities/Companies/LeaveRequest";

export class CreateLeaveRequestDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsDateString()
  @IsNotEmpty()
  startDate!: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate!: Date;

  @IsEnum(LeaveType)
  @IsNotEmpty()
  leaveType!: LeaveType;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateLeaveRequestDto {
  @IsEnum(LeaveRequestStatus)
  @IsOptional()
  status?: LeaveRequestStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class LeaveRequestResponseDto {
  id!: string;
  userId!: string;
  startDate!: Date;
  endDate!: Date;
  leaveType!: LeaveType;
  status!: LeaveRequestStatus;
  reason?: string;
  rejectionReason?: string;
}
