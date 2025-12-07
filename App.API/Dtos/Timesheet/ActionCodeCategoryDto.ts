import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateActionCodeCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdateActionCodeCategoryDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}

export class ActionCodeCategoryResponseDto {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;
}
