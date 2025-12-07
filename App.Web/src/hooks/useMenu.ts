/**
 * @file This file contains a custom React hook for fetching the user's personalized menu.
 * @module hooks/useMenu
 */

import { useQuery } from '@tanstack/react-query';

import { MenuResponseDto } from '../lib/api'; // Assuming MenuResponseDto is exported from lib/api/index.ts
import { UsersService } from '../lib/api/services/UsersService';

/**
 * Custom hook to fetch the authenticated user's personalized menu.
 * The menu includes categories and cards, filtered by user permissions and company.
 *
 * @returns {object} An object containing:
 *   - `menu`: The fetched menu data (MenuResponseDto) or undefined.
 *   - `isLoading`: A boolean indicating if the menu data is currently being loaded.
 *   - `isError`: A boolean indicating if an error occurred while fetching the menu data.
 *   - `error`: The error object if an error occurred.
 */
export const useMenu = () => {
  const {
    data: menu,
    isLoading,
    isError,
    error,
  } = useQuery<MenuResponseDto, Error>({
    queryKey: ['userMenu'],
    queryFn: () => UsersService.getMenuForMe(),
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
    // You might want to add error handling or retry logic here
  });

  return { menu, isLoading, isError, error };
};
