import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateRoleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class RoleResponse {
  id!: string;
  name!: string;
  description?: string;
  companyId!: string;
}
