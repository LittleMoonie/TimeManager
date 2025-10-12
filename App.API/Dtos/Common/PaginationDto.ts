import { IsInt, IsOptional, IsString, Min, IsIn } from "class-validator";

/** @summary Query params for pagination and free-text search. */
export class PaginationQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 25;

  @IsString()
  @IsOptional()
  sort?: string;

  @IsIn(["asc", "desc"])
  @IsOptional()
  sortDir?: "asc" | "desc";

  @IsString()
  @IsOptional()
  q?: string;
}

/** @summary Standard paginated response envelope. */
export class PaginatedResponseDto<T> {
  page!: number;
  limit!: number;
  total!: number;
  data!: T[];
  sort?: string;
  sortDir?: "asc" | "desc";
}
