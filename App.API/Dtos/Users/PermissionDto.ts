import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export interface PermissionResponse {
  id: string;
  name: string;
  description?: string;
  companyId: string;
}
