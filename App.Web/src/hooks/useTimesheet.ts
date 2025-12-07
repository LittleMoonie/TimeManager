import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { startTransition } from 'react';

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
  note: string | null;
};

type EntriesMap = Record<string, WeeklyEntry>;
const AUTOSAVE_DEBOUNCE_MS = 1200;

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

const normalizeEntries = (entries: EntriesMap): EntriesMap => {
  const sortedKeys = Object.keys(entries).sort();
  const normalized: EntriesMap = {};
  for (const key of sortedKeys) {
    const entry = entries[key];
    normalized[key] = {
      minutes: entry?.minutes ?? 0,
      note: entry?.note ?? null,
    };
  }
  return normalized;
};

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
        : (row.employeeCountryCode ?? row.countryCode ?? null),
    status: row.status,
    locked: row.locked,
    entries: Object.entries(row.entries)
      .map(([day, entry]) => ({
        day,
        minutes: entry.minutes,
        note: entry.note ?? null,
      }))
      .filter((entry) => entry.minutes > 0 || (entry.note !== null && entry.note.trim().length > 0))
      .sort((a, b) => a.day.localeCompare(b.day)),
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

const buildComparableSnapshot = (inputRows: WeeklyRowState[]): string => {
  const comparableRows = [...inputRows]
    .map((row) => {
      const entries = Object.entries(normalizeEntries(row.entries))
        .map(([day, entry]) => ({
          day,
          minutes: entry.minutes,
          note: entry.note ?? null,
        }))
        .filter(
          (entry) => entry.minutes > 0 || (entry.note !== null && entry.note.trim().length > 0),
        )
        .sort((a, b) => a.day.localeCompare(b.day));

      return {
        // ⚠️ Remove volatile fields like id, locked, status
        timeCodeId: row.timeCodeId,
        activityLabel: row.activityLabel,
        billable: row.billable,
        location: row.location,
        countryCode: row.countryCode,
        employeeCountryCode: row.employeeCountryCode ?? null,
        entries,
      };
    })
    .sort((a, b) => a.timeCodeId.localeCompare(b.timeCodeId));

  return JSON.stringify(comparableRows);
};

export const useWeeklyTimesheet = ({
  weekStart,
}: UseWeeklyTimesheetOptions): WeeklyTimesheetStore => {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<WeeklyRowState[]>([]);
  const [serverStateRows, setServerStateRows] = useState<WeeklyRowState[]>([]);
  const latestRowsRef = useRef<WeeklyRowState[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedComparableRef = useRef<string>('');
  const [settings, setSettings] = useState<TimesheetWeekSettingsDto | undefined>();
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | undefined>();
  const [timesheetStatus, setTimesheetStatus] = useState<TimesheetStatus | undefined>();
  const [rejectionInfo, setRejectionInfo] = useState<TimesheetWeekRejectionDto | undefined>();
  const isSavingRef = useRef(false);

  const weekQuery = useQuery<
    TimesheetWeekResponseDto,
    Error,
    TimesheetWeekResponseDto,
    [string, string, string]
  >({
    queryKey: ['timesheet', 'week', weekStart],
    queryFn: () => TimesheetWeeksService.getWeekTimesheet({ weekStart }),
    initialData: queryClient.getQueryData<TimesheetWeekResponseDto>([
      'timesheet',
      'week',
      weekStart,
    ]),
  });

  useEffect(() => {
    if (weekQuery.data && !isSavingRef.current) {
      const serverState = mapResponseToState(weekQuery.data);
      const snapshot = buildComparableSnapshot(serverState);
      latestRowsRef.current = serverState;
      startTransition(() => {
        setServerStateRows(serverState);
        setRows(serverState);
        setSettings(mapSettings(weekQuery.data));
        setDirty(false);
        setTimesheetStatus(weekQuery.data.status);
        setRejectionInfo(weekQuery.data.rejection);
      });
      lastSavedComparableRef.current = snapshot;
      queryClient.setQueryData(['timesheet', 'week', weekStart], weekQuery.data);
    }
  }, [weekQuery.data, weekStart, queryClient]);

  const saveMutation = useMutation({
    mutationFn: (payload: TimesheetWeekUpsertDto) =>
      TimesheetWeeksService.upsertWeekTimesheet({ weekStart, requestBody: payload }),
    onSuccess: (data: TimesheetWeekResponseDto) => {
      isSavingRef.current = false;
      const serverState = mapResponseToState(data);
      const snapshot = buildComparableSnapshot(serverState);
      latestRowsRef.current = serverState;
      setServerStateRows(serverState);
      setRows(serverState);
      setSettings(mapSettings(data));
      setDirty(false);
      setLastSavedAt(new Date());
      setTimesheetStatus(data.status);
      setRejectionInfo(data.rejection);
      lastSavedComparableRef.current = snapshot;
      queryClient.setQueryData(['timesheet', 'week', weekStart], data);
    },
    onError: () => {
      isSavingRef.current = false;
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => TimesheetWeeksService.submitWeekTimesheet({ weekStart }),
    onSuccess: (data: TimesheetWeekResponseDto) => {
      const serverState = mapResponseToState(data);
      const snapshot = buildComparableSnapshot(serverState);
      latestRowsRef.current = serverState;
      setServerStateRows(serverState);
      setRows(serverState);
      setSettings(mapSettings(data));
      setDirty(false);
      setTimesheetStatus(data.status);
      setRejectionInfo(data.rejection);
      lastSavedComparableRef.current = snapshot;
      queryClient.setQueryData(['timesheet', 'week', weekStart], data);
    },
  });

  useEffect(() => {
    latestRowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, []);

  const flushChangesRef = useRef<(() => void) | null>(null);

  const flushChanges = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    const currentRows = latestRowsRef.current;
    const payloadRows = currentRows;

    if (
      timesheetStatus === TimesheetStatus.SUBMITTED ||
      timesheetStatus === TimesheetStatus.APPROVED
    ) {
      const serverRowsById = new Map(
        serverStateRows
          .filter((r) => r.id !== undefined && r.id !== null)
          .map((r) => [r.id as string, r] as [string, WeeklyRowState]),
      );
      const currentRowIds = new Set(
        currentRows.map((r) => r.id).filter((id): id is string => Boolean(id)),
      );

      const deletedServerRows: WeeklyRowState[] = [];
      for (const [serverId, serverRow] of serverRowsById.entries()) {
        if (!currentRowIds.has(serverId)) {
          deletedServerRows.push(serverRow);
        }
      }
    }

    if (saveMutation.isPending) {
      if (dirty && flushChangesRef.current) {
        debounceTimer.current = setTimeout(flushChangesRef.current, AUTOSAVE_DEBOUNCE_MS);
      }
      return;
    }

    const snapshot = buildComparableSnapshot(currentRows);

    if (snapshot === lastSavedComparableRef.current) {
      setDirty(false);
      return;
    }

    if (submitMutation.isPending) return;

    const payload: TimesheetWeekUpsertDto = {
      rows: payloadRows.map(mapRowToDto),
    };

    saveMutation.mutate(payload);
  }, [saveMutation, dirty, timesheetStatus, serverStateRows, submitMutation.isPending]);

  useEffect(() => {
    flushChangesRef.current = flushChanges;
  }, [flushChanges]);

  const scheduleSave = useCallback(
    (nextRows: WeeklyRowState[]) => {
      const currentSnapshot = buildComparableSnapshot(latestRowsRef.current);
      const nextSnapshot = buildComparableSnapshot(nextRows);

      if (nextSnapshot === currentSnapshot) {
        return;
      }

      isSavingRef.current = true;
      latestRowsRef.current = nextRows;
      setRows(nextRows);
      setDirty(true);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(flushChanges, AUTOSAVE_DEBOUNCE_MS);
    },
    [flushChanges],
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
                  Object.entries(patch.entries).map(([day, entry]) => [day, { ...entry }]),
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
            note: patch.note ?? previous.note ?? null,
          };
          if (next.minutes <= 0 && !next.note) {
            delete nextEntries[day];
          } else {
            nextEntries[day] = next;
          }
          return {
            ...row,
            entries: nextEntries,
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
    flushChanges();
  }, [flushChanges]);

  const submitWeek = useCallback(() => {
    forceSave();
    submitMutation.mutate(undefined);
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
