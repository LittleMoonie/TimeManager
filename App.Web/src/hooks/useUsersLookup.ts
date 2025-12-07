import { useQuery } from '@tanstack/react-query';

import { UsersService } from '@/lib/api';

export const useUsersLookup = (query: string) => {
  return useQuery({
    queryKey: ['users', 'lookup', query],
    queryFn: () => UsersService.getUsers({ q: query, limit: 10 }),
    enabled: query.length > 2, // Only search when query is long enough
  });
};
