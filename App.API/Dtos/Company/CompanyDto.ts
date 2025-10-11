import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

export class CompanyResponseDto {
  id!: string;
  name!: string;
  timezone?: string;
}
