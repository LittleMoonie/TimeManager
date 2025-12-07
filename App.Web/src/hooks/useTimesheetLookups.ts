import { useQuery } from '@tanstack/react-query';

import { ActionCodesService, ActionCode, CountriesService } from '@/lib/api';

export const useTimeCodesLookup = (query: string) =>
  useQuery<ActionCode[]>({
    queryKey: ['timesheet', 'lookups', 'time-codes', query],
    queryFn: () => ActionCodesService.searchActionCodes({ q: query }),
    staleTime: 5 * 60 * 1000,
  });

type CountryLookup = { code: string; name: string; hasOffice: boolean };

const normalizeCountryCode = (code: string) => code.toUpperCase();

export const useCountriesLookup = () =>
  useQuery<Array<CountryLookup>>({
    queryKey: ['timesheet', 'lookups', 'countries'],
    queryFn: () => CountriesService.listCountries(),
    staleTime: 24 * 60 * 60 * 1000,
    select: (countries) =>
      countries.map((country) => ({
        ...country,
        code: normalizeCountryCode(country.code),
      })),
  });
