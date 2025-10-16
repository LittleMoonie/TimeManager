import { useQuery } from '@tanstack/react-query';

import { ActionCodesService, ActionCode, CountriesService } from '@/lib/api';

export const useTimeCodesLookup = (query: string) =>
  useQuery<ActionCode[]>({
    queryKey: ['timesheet', 'lookups', 'time-codes', query],
    queryFn: () => ActionCodesService.searchActionCodes({ q: query }),
    staleTime: 5 * 60 * 1000,
  });

export const useCountriesLookup = () =>
  useQuery<Array<{ code: string; name: string; hasOffice: boolean }>>({
    queryKey: ['timesheet', 'lookups', 'countries'],
    queryFn: () => CountriesService.listCountries(),
    staleTime: 24 * 60 * 60 * 1000,
  });
