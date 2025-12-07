import { IsInt, IsOptional, IsString, Min, IsIn } from 'class-validator';

/**
 * @description Data transfer object for query parameters related to pagination and free-text search.
 */
export class PaginationQueryDto {
  /**
   * @description Optional: The page number to retrieve, starting from 1.
   * @example 1
   */
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  /**
   * @description Optional: The maximum number of items to return per page.
   * @example 25
   */
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 25;

  /**
   * @description Optional: The field by which to sort the results.
   * @example "createdAt"
   */
  @IsString()
  @IsOptional()
  sort?: string;

  /**
   * @description Optional: The direction to sort the results, either "asc" for ascending or "desc" for descending.
   * @example "desc"
   */
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortDir?: 'asc' | 'desc';

  /**
   * @description Optional: A free-text search query string to filter results.
   * @example "search term"
   */
  @IsString()
  @IsOptional()
  q?: string;
}

/**
 * @description Standard data transfer object for encapsulating paginated API responses.
 * @template T The type of the data items contained in the paginated response.
 */
export class PaginatedResponseDto<T> {
  /**
   * @description The current page number of the results.
   * @example 1
   */
  page!: number;
  /**
   * @description The maximum number of items requested per page.
   * @example 25
   */
  limit!: number;
  /**
   * @description The total number of items available across all pages.
   * @example 100
   */
  total!: number;
  /**
   * @description An array of data items for the current page.
   */
  data!: T[];
  /**
   * @description Optional: The field by which the results are sorted.
   * @example "createdAt"
   */
  sort?: string;
  /**
   * @description Optional: The direction in which the results are sorted ("asc" or "desc").
   * @example "desc"
   */
  sortDir?: 'asc' | 'desc';
}
