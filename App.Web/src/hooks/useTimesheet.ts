import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { ActionCode, TimesheetEntriesService } from '@/lib/api';
import { ActionCodesService, TimesheetsService, TimesheetHistory } from '@/lib/api';
import { TimesheetEntry, CreateTimesheetEntryDto } from '@/lib/api';

export const useActionCodes = () => {
  return useQuery<ActionCode[]>({
    queryKey: ['timesheet', 'action-codes'],
    queryFn: async () => {
      const result = await ActionCodesService.getActionCode({ id: '1' });
      return Array.isArray(result) ? result : [result];
    },
    staleTime: Infinity,
  });
};

export const useTimesheet = (weekStartISO: string, page: number, limit: number) => {
  const queryClient = useQueryClient();

  const timesheetQuery = useQuery<{
    lastPage: number;
    page: number;
    total: number;
    data: TimesheetEntry[];
  }>({
    queryKey: ['timesheet', weekStartISO, page, limit],
    queryFn: async () => {
      const result = await TimesheetsService.getTimesheet({ id: '1' });
      return {
        lastPage: result.lastPage,
        page: result.page,
        total: result.total,
        data: result.data,
      };
    },
    staleTime: 0,
    select: (data) => ({
      lastPage: data.lastPage,
      page: data.page,
      total: data.total,
      data: data.data,
    }),
  });

  const createTimeEntry = useMutation({
    mutationFn: async (entry: CreateTimesheetEntryDto) =>
      TimesheetEntriesService.createTimesheetEntry({ requestBody: entry }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', weekStartISO, page, limit] });
    },
  });

  const updateTimeEntry = useMutation({
    mutationFn: async ({ id, entry }: { id: string; entry: Partial<CreateTimesheetEntryDto> }) =>
      TimesheetEntriesService.updateTimesheetEntry({ id, requestBody: entry }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', weekStartISO, page, limit] });
    },
  });

  const deleteTimeEntry = useMutation({
    mutationFn: async (id: string) => TimesheetEntriesService.deleteTimesheetEntry({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', weekStartISO, page, limit] });
    },
  });

  const approveTimeEntry = useMutation({
    mutationFn: async (id: string) =>
      TimesheetEntriesService.approveTimesheetEntry({
        id: id,
        requestBody: { reason: 'Approved' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', weekStartISO, page, limit] });
    },
  });

  const rejectTimeEntry = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) =>
      TimesheetEntriesService.rejectTimesheetEntry({ id, requestBody: { reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', weekStartISO, page, limit] });
    },
  });

  const helpers = useMemo(() => {
    const data = timesheetQuery.data?.data;
    if (!data) {
      return {
        computeDayTotal: () => 0,
        weeklyTotal: 0,
      };
    }

    return {
      computeDayTotal: (iso: string) => {
        return data.reduce((total, entry) => {
          if (entry.day === iso) {
            return total + entry.durationMin;
          }
          return total;
        }, 0);
      },
      weeklyTotal: data.reduce((total, entry) => total + entry.durationMin, 0),
    };
  }, [timesheetQuery.data]);

  return {
    timesheetQuery,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    approveTimeEntry,
    rejectTimeEntry,
    helpers,
  };
};

export const useTimesheetHistory = () =>
  useQuery<TimesheetHistory[]>({
    queryKey: ['timesheet', 'history'],

    queryFn: () => TimesheetService.getTimesheetHistory(),

    staleTime: 10 * 1000,
  });
