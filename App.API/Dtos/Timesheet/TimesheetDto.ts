import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
} from "class-validator";

export class CreateTimesheetDto {
  @IsDateString()
  @IsNotEmpty()
  periodStart!: string;

  @IsDateString()
  @IsNotEmpty()
  periodEnd!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateTimesheetEntryDto {
  @IsString()
  @IsNotEmpty()
  actionCodeId!: string;

  @IsDateString()
  @IsNotEmpty()
  day!: string;

  @IsInt()
  @Min(0)
  @Max(1440)
  durationMin!: number;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateTimesheetEntryDto {
  @IsString()
  @IsOptional()
  actionCodeId?: string;

  @IsDateString()
  @IsOptional()
  day?: string;

  @IsInt()
  @Min(0)
  @Max(1440)
  @IsOptional()
  durationMin?: number;

  @IsString()
  @IsOptional()
  note?: string;
}

export class TimesheetEntryResponseDto {
  id!: string;
  actionCodeId!: string;
  day!: string;
  durationMin!: number;
  note?: string;
}
