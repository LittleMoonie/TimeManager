import { IsNotEmpty, IsString, IsOptional, IsUUID } from "class-validator";

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;
}

export class TeamResponseDto {
  id!: string;
  name!: string;
  companyId!: string;
}

export class AddTeamMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  role!: string;
}

export class TeamMemberResponseDto {
  id!: string;
  teamId!: string;
  userId!: string;
  role!: string;
}
