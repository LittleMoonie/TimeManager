import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  TimesheetRowLocation,
  TimesheetStatus,
  TimesheetWeekResponseDto,
  TimesheetWeekRowDto,
  TimesheetWeekRowRejectionDto,
  TimesheetWeekSettingsDto,
  TimesheetWeekUpsertDto,
  TimesheetWeekRejectionDto,
  TimesheetWeeksService,
} from '@/lib/api';

export type WeeklyRowStatus = TimesheetWeekRowDto['status'];
export type WeeklyRowBillable = TimesheetWeekRowDto['billable'];
export type WeeklyRowLocation = TimesheetWeekRowDto['location'];

type WeeklyEntry = {
  minutes: number;
  note?: string | null;
};

type EntriesMap = Record<string, WeeklyEntry>;

export interface WeeklyRowState {
  clientId: string;
  id?: string;
  activityLabel: string;
  timeCodeId: string;
  timeCodeName?: string;
  timeCodeCode?: string;
  billable: WeeklyRowBillable;
  location: WeeklyRowLocation;
  countryCode: string;
  employeeCountryCode?: string | null;
  status: WeeklyRowStatus;
  locked: boolean;
  entries: EntriesMap;
  rejection?: TimesheetWeekRowRejectionDto;
}

interface UseWeeklyTimesheetOptions {
  weekStart: string;
}

type RowPatch = Partial<Omit<WeeklyRowState, 'entries'>> & { entries?: EntriesMap };

const mapDtoToRow = (row: TimesheetWeekRowDto): WeeklyRowState => ({
  clientId:
    row.id ??
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${row.timeCodeId}-${Math.random().toString(16).slice(2)}`),
  id: row.id,
  activityLabel: row.activityLabel,
  timeCodeId: row.timeCodeId,
  timeCodeName: undefined,
  timeCodeCode: undefined,
  billable: row.billable,
  location: row.location,
  countryCode: row.countryCode,
  employeeCountryCode: row.employeeCountryCode ?? null,
  status: row.status,
  locked: row.locked,
  entries: Object.fromEntries(
    (row.entries ?? []).map((entry) => [
      entry.day,
      {
        minutes: entry.minutes,
        note: entry.note ?? null,
      },
    ]),
  ),
});

const mapRowToDto = (row: WeeklyRowState): TimesheetWeekRowDto => {
  const dto: TimesheetWeekRowDto = {
    id: row.id,
    activityLabel: row.activityLabel,
    timeCodeId: row.timeCodeId,
    billable: row.billable,
    location: row.location,
    countryCode: row.countryCode,
    employeeCountryCode:
      row.location === TimesheetRowLocation.OFFICE
        ? null
        : row.employeeCountryCode ?? row.countryCode ?? null,
    status: row.status,
    locked: row.locked,
    entries: Object.entries(row.entries)
      .map(([day, entry]) => ({
        day,
        minutes: entry.minutes,
        note: entry.note ?? null,
      }))
      .filter((entry) => entry.minutes > 0),
  };

  return dto;
};

const mapResponseToState = (data: TimesheetWeekResponseDto): WeeklyRowState[] =>
  (data.rows ?? []).map(mapDtoToRow);

const mapSettings = (data?: TimesheetWeekResponseDto): TimesheetWeekSettingsDto | undefined =>
  data?.settings;

export interface WeeklyTimesheetStore {
  rows: WeeklyRowState[];
  settings?: TimesheetWeekSettingsDto;
  isLoading: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  error?: unknown;
  dirty: boolean;
  lastSavedAt?: Date;
  timesheetStatus?: TimesheetStatus;
  rejection?: TimesheetWeekRejectionDto;
  refresh: () => void;
  updateRow: (rowId: string, patch: RowPatch) => void;
  updateEntry: (rowId: string, day: string, patch: Partial<WeeklyEntry>) => void;
  replaceRows: (rows: WeeklyRowState[]) => void;
  submitWeek: () => void;
  forceSave: () => void;
}

export const useWeeklyTimesheet = ({
  weekStart,
}: UseWeeklyTimesheetOptions): WeeklyTimesheetStore => {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<WeeklyRowState[]>([]);
  const [settings, setSettings] = useState<TimesheetWeekSettingsDto | undefined>();
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | undefined>();
  const [timesheetStatus, setTimesheetStatus] = useState<TimesheetStatus | undefined>();
  const [rejectionInfo, setRejectionInfo] = useState<TimesheetWeekRejectionDto | undefined>();

  const weekQuery = useQuery<TimesheetWeekResponseDto, Error, TimesheetWeekResponseDto, [string, string, string]>({
    queryKey: ['timesheet', 'week', weekStart],
    queryFn: () => TimesheetWeeksService.getWeekTimesheet({ weekStart }),
    initialData: queryClient.getQueryData<TimesheetWeekResponseDto>(['timesheet', 'week', weekStart]),
  });
  useEffect(() => {
    if (weekQuery.data) {
      const serverState = mapResponseToState(weekQuery.data);
      setRows(serverState);
      setSettings(mapSettings(weekQuery.data));
      setDirty(false);
      setTimesheetStatus(weekQuery.data.status);
      setRejectionInfo(weekQuery.data.rejection);
      queryClient.setQueryData(['timesheet', 'week', weekStart], weekQuery.data);
    }
  }, [weekQuery.data, weekStart, queryClient]);

  const saveMutation = useMutation({
    mutationFn: (payload: TimesheetWeekUpsertDto) =>
      TimesheetWeeksService.upsertWeekTimesheet({ weekStart, requestBody: payload }),
    onSuccess: (data: TimesheetWeekResponseDto) => {
      const serverState = mapResponseToState(data);
      setRows(serverState);
      setSettings(mapSettings(data));
      setDirty(false);
      setLastSavedAt(new Date());
      setTimesheetStatus(data.status);
      setRejectionInfo(data.rejection);
      queryClient.setQueryData(['timesheet', 'week', weekStart], data);
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => TimesheetWeeksService.submitWeekTimesheet({ weekStart }),
    onSuccess: (data: TimesheetWeekResponseDto) => {
      const serverState = mapResponseToState(data);
      setRows(serverState);
      setSettings(mapSettings(data));
      setDirty(false);
      setTimesheetStatus(data.status);
      setRejectionInfo(data.rejection);
      queryClient.setQueryData(['timesheet', 'week', weekStart], data);
    },
  });

  const scheduleSave = useCallback(
    (nextRows: WeeklyRowState[]) => {
      const excludeKeys = ['clientId', 'id', 'timeCodeName', 'timeCodeCode', 'rejection', 'locked', 'status'];
      const currentRowsFiltered = rows.map((row) => {
        const newRow = { ...row };
        excludeKeys.forEach((key) => delete newRow[key as keyof WeeklyRowState]);
        return newRow;
      });
      const nextRowsFiltered = nextRows.map((row) => {
        const newRow = { ...row };
        excludeKeys.forEach((key) => delete newRow[key as keyof WeeklyRowState]);
        return newRow;
      });

      if (JSON.stringify(nextRowsFiltered) === JSON.stringify(currentRowsFiltered)) {
        return;
      }
      setRows(nextRows);
      setDirty(true);

      const payload: TimesheetWeekUpsertDto = {
        rows: nextRows.map(mapRowToDto),
      };
      saveMutation.mutate(payload);
    },
    [rows, saveMutation, weekStart],
  );

  const updateRow = useCallback(
    (rowId: string, patch: RowPatch) => {
      scheduleSave(
        rows.map((row) => {
          const key = row.id ?? row.clientId;
          if (key !== rowId) return row;

          const nextEntries =
            patch.entries !== undefined
              ? Object.fromEntries(
                  Object.entries(patch.entries).map(([day, entry]) => [
                    day,
                    { ...entry },
                  ]),
                )
              : row.entries;

          return {
            ...row,
            ...patch,
            entries: nextEntries,
          };
        }),
      );
    },
    [rows, scheduleSave],
  );

  const updateEntry = useCallback(
    (rowId: string, day: string, patch: Partial<WeeklyEntry>) => {
      scheduleSave(
        rows.map((row) => {
          const key = row.id ?? row.clientId;
          if (key !== rowId) return row;
          const nextEntries: EntriesMap = { ...row.entries };
          const previous = nextEntries[day] ?? { minutes: 0, note: null };
          const next: WeeklyEntry = {
            minutes:
              patch.minutes !== undefined
                ? Math.max(0, Math.round(patch.minutes))
                : previous.minutes,
            note: patch.note !== undefined ? patch.note : previous.note ?? null,
          };
          if (next.minutes <= 0 && !next.note) {
            delete nextEntries[day];
          } else {
            nextEntries[day] = next;
          }
          return {
            ...row,
            entries: nextEntries,
            locked: row.locked,
          };
        }),
      );
    },
    [rows, scheduleSave],
  );

  const replaceRows = useCallback(
    (nextRows: WeeklyRowState[]) => {
      scheduleSave(nextRows);
    },
    [scheduleSave],
  );

  const forceSave = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    const payload: TimesheetWeekUpsertDto = {
      rows: rows.map(mapRowToDto),
    };
    saveMutation.mutate(payload);
  }, [rows, saveMutation]);

  const submitWeek = useCallback(() => {
    forceSave();
    submitMutation.mutate();
  }, [forceSave, submitMutation]);

  return {
    rows,
    settings,
    isLoading: weekQuery.isLoading,
    isSaving: saveMutation.isPending,
    isSubmitting: submitMutation.isPending,
    error: weekQuery.error ?? saveMutation.error ?? submitMutation.error,
    dirty,
    lastSavedAt,
    timesheetStatus,
    rejection: rejectionInfo,
    refresh: () => weekQuery.refetch(),
    updateRow,
    updateEntry,
    replaceRows,
    submitWeek,
    forceSave,
  };
};
