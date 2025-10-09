import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { timesheetApi, timesheetUtils } from '@/lib/api/timesheet';
import type {
  ActionCode,
  ActionCodeId,
  CellEntry,
  ISODate,
  Timesheet,
} from '@/types';

export const useActionCodes = () =>
  useQuery<ActionCode[]>({
    queryKey: ['timesheet', 'action-codes'],
    queryFn: () => timesheetApi.getActionCodes(),
    staleTime: Infinity,
  });

export const useTimesheet = (weekStartISO: ISODate) => {
  const queryClient = useQueryClient();

  const timesheetQuery = useQuery<Timesheet>({
    queryKey: ['timesheet', weekStartISO],
    queryFn: () => timesheetApi.getTimesheet(weekStartISO),
    staleTime: 0,
  });

  const updateCell = useMutation({
    mutationFn: async ({
      timesheetId,
      code,
      dateISO,
      entry,
    }: {
      timesheetId: string;
      code: ActionCodeId;
      dateISO: ISODate;
      entry: CellEntry;
    }) => timesheetApi.upsertCellEntry(timesheetId, code, dateISO, entry),
    onSuccess: (data) => {
      queryClient.setQueryData(['timesheet', data.weekStartISO], data);
    },
  });

  const removeCell = useMutation({
    mutationFn: ({
      timesheetId,
      code,
      dateISO,
    }: {
      timesheetId: string;
      code: ActionCodeId;
      dateISO: ISODate;
    }) => timesheetApi.removeCell(timesheetId, code, dateISO),
    onSuccess: (data) => {
      queryClient.setQueryData(['timesheet', data.weekStartISO], data);
    },
  });

  const removeActionCode = useMutation({
    mutationFn: ({
      timesheetId,
      code,
    }: {
      timesheetId: string;
      code: ActionCodeId;
    }) => timesheetApi.removeActionCode(timesheetId, code),
    onSuccess: (data) => {
      queryClient.setQueryData(['timesheet', data.weekStartISO], data);
    },
  });

  const sendDay = useMutation({
    mutationFn: ({
      timesheetId,
      dateISO,
      deficitReason,
      locationAudit,
    }: {
      timesheetId: string;
      dateISO: ISODate;
      deficitReason?: string;
      locationAudit?: Array<{ mode: string; country: string }>;
    }) => timesheetApi.sendDay({ timesheetId, dateISO, deficitReason, locationAudit }),
    onSuccess: (data) => {
      queryClient.setQueryData(['timesheet', data.weekStartISO], data);
    },
  });

  const autoSend = useMutation({
    mutationFn: ({
      timesheetId,
      weekStartISO: targetWeekStart,
    }: {
      timesheetId: string;
      weekStartISO: ISODate;
    }) => timesheetApi.autoSendWeek({ timesheetId, weekStartISO: targetWeekStart }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', variables.weekStartISO] });
    },
  });

  const helpers = useMemo(() => {
    const data = timesheetQuery.data;
    if (!data) {
      return {
        computeDayTotal: () => 0,
        weeklyTotal: 0,
      };
    }

    return {
      computeDayTotal: (iso: ISODate) => timesheetUtils.computeDayTotal(data.entries, iso),
      weeklyTotal: timesheetUtils.computeWeekTotal(data.entries),
    };
  }, [timesheetQuery.data]);

  return {
    timesheetQuery,
    updateCell,
    removeCell,
    removeActionCode,
    sendDay,
    autoSend,
    helpers,
  };
};

export const useTimesheetHistory = () =>
  useQuery<Timesheet[]>({
    queryKey: ['timesheet', 'history'],
    queryFn: () => timesheetApi.listTimesheets(),
    staleTime: 10 * 1000,
  });
