import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export interface MenuCardDto {
  id: string;
  categoryKey: string;
  title: string;
  subtitle: string;
  route: string;
  icon?: string;
  requiredPermission?: string;
  featureFlag?: string;
  isEnabled: boolean;
  sortOrder: number;
}

export interface MenuCategoryDto {
  id: string;
  key: string;
  title: string;
  icon?: string;
  sortOrder: number;
  cards: MenuCardDto[];
}

export interface MenuResponseDto {
  categories: MenuCategoryDto[];
}

export class CreateMenuCardDto {
  @IsUUID()
  companyId: string;

  @IsString()
  categoryKey: string;

  @IsString()
  title: string;

  @IsString()
  subtitle: string;

  @IsString()
  route: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  requiredPermission?: string;

  @IsOptional()
  @IsString()
  featureFlag?: string;

  @IsBoolean()
  isEnabled: boolean;

  @IsOptional()
  sortOrder?: number;
}

export class UpdateMenuCardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  route?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  requiredPermission?: string;

  @IsOptional()
  @IsString()
  featureFlag?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  sortOrder?: number;
}

export class CreateMenuCategoryDto {
  @IsUUID()
  companyId: string;

  @IsString()
  key: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  sortOrder?: number;
}

export class UpdateMenuCategoryDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  sortOrder?: number;
}
