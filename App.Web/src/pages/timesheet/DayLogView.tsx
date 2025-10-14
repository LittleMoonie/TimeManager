import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  Paper,
  Grid,
  Tooltip,
  Autocomplete,
  MenuItem,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Add, ChevronLeft, ChevronRight, Clear, Delete, DeleteForever } from '@mui/icons-material';
import { COUNTRIES } from '@/constants/countries';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Meridian } from './utils';
import {
  ActionCode,
  TimesheetEntryResponseDto,
  TimesheetResponseDto,
  WorkMode,
  CreateTimesheetEntryDto,
  UpdateTimesheetEntryDto,
  TimesheetEntriesService,
} from '@/lib/api';
import {
  getWeekDates,
  isPastDeadline,
  isPastWeek,
  isAttentionRequired,
  toISODate,
  formatDayLabel,
  formatMinutes,
  formatIntervals,
} from './utils';

type DayEntryRow = {
  internalId: string;
  actionCodeId: ActionCode['id'] | '';
  minutes: number;
  mode: WorkMode;
  country: string;
  note: string;
  intervals: { start: string; end: string }[];
  existing: boolean;
  entryId?: string; // To store the actual entry ID if it exists in the backend
};

interface DayLogViewProps {
  date: Date;
  timesheet?: TimesheetResponseDto;
  actionCodes: ActionCode[];
  onChangeDate: (date: Date) => void;

  dailyMin: number;
  weekStart: Date;
}

const MAX_DAY_MINUTES = 24 * 60;
const MERIDIANS: Meridian[] = ['AM', 'PM'];

const ensureMeridianTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const nextHours = hours % 12 || 12;
  return `${nextHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const splitMeridianTime = (time: string): { time: string; period: Meridian } => {
  const [hours, minutes, period] = time.match(/(\d+):(\d+)\s*(AM|PM)/)?.slice(1) ?? [];
  return { time: `${hours}:${minutes}`, period: period as Meridian };
};

const buildMeridianTime = (time: string, period: Meridian): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const nextHours = hours % 12 || 12;
  return `${nextHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const createRowFromEntry = (entry: TimesheetEntryResponseDto): DayEntryRow => ({
  internalId: entry.id,
  entryId: entry.id,
  actionCodeId: entry.actionCodeId,
  minutes: entry.durationMin,
  mode: entry.workMode,
  country: entry.country,
  note: entry.note ?? '',
  intervals: [], // Intervals are not directly from DTO, will be derived or managed on frontend
  existing: true,
});

const createEmptyRow = (): DayEntryRow => ({
  internalId: crypto.randomUUID(),
  actionCodeId: '',
  minutes: 0,
  mode: WorkMode.OFFICE,
  country: 'US',
  note: '',
  intervals: [],
  existing: false,
});

export const DayLogView = ({
  date,
  timesheet,
  actionCodes,
  onChangeDate,
  dailyMin,
  weekStart,
}: DayLogViewProps) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<DayEntryRow[]>([createEmptyRow()]);
  const [reason, setReason] = useState('');

  const dateISO = toISODate(date);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const currentIndex = weekDates.findIndex((day) => toISODate(day) === dateISO);

  const now = new Date();
  const locked = isPastDeadline(weekStart, now);
  const readOnly =
    isPastWeek(weekStart, now) && !isAttentionRequired(timesheet ?? { status: 'DRAFT' });

  const analyzeIntervals = (
    intervals: DayEntryRow['intervals'],
  ): { kind: 'ok' | 'warning' | 'error'; totalMinutes: number } => {
    const totalMinutes = intervals.reduce((sum, interval) => {
      // Assuming intervals are in HH:MM format and represent duration
      // This needs to be properly calculated from start and end times if they are actual timestamps
      const [startHour, startMinute] = interval.start.split(':').map(Number);
      const [endHour, endMinute] = interval.end.split(':').map(Number);
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      return sum + (endTotalMinutes - startTotalMinutes);
    }, 0);
    return { kind: 'ok', totalMinutes };
  };
  const codeById = useMemo(() => {
    const map = new Map<ActionCode['id'], ActionCode>();
    actionCodes.forEach((code) => map.set(code.id, code));
    return map;
  }, [actionCodes]);

  useEffect(() => {
    if (!timesheet || !timesheet.entries) return;
    const dayRows: DayEntryRow[] = [];

    timesheet.entries.forEach((entry) => {
      if (entry.day === dateISO) {
        dayRows.push(createRowFromEntry(entry));
      }
    });
    setRows(dayRows.length ? dayRows : [createEmptyRow()]);
    setReason('');
  }, [timesheet, dateISO]);

  const createEntryMutation = useMutation({
    mutationFn: (dto: CreateTimesheetEntryDto) =>
      TimesheetEntriesService.createTimesheetEntry({ requestBody: dto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets', timesheet?.id] });
    },
    onError: (err: any) => {
      console.error('Failed to create timesheet entry:', err);
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ entryId, dto }: { entryId: string; dto: UpdateTimesheetEntryDto }) =>
      TimesheetEntriesService.updateTimesheetEntry({ id: entryId, requestBody: dto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets', timesheet?.id] });
    },
    onError: (err: any) => {
      console.error('Failed to update timesheet entry:', err);
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => TimesheetEntriesService.deleteTimesheetEntry({ id: entryId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets', timesheet?.id] });
    },
    onError: (err: any) => {
      console.error('Failed to delete timesheet entry:', err);
    },
  });

  const handleSaveDayEntries = async () => {
    if (!timesheet?.id) return;

    for (const row of rows) {
      if (!row.actionCodeId || row.minutes === 0) continue; // Skip empty or incomplete rows

      const entryData = {
        actionCodeId: row.actionCodeId,
        day: dateISO,
        durationMin: row.minutes,
        country: row.country,
        workMode: row.mode,
        note: row.note,
      };

      if (row.existing && row.entryId) {
        // Assuming we need to check if the row has actually changed to avoid unnecessary updates
        // For simplicity, we'll update if it's an existing row and not empty
        await updateEntryMutation.mutateAsync({ entryId: row.entryId, dto: entryData });
      } else if (!row.existing) {
        await createEntryMutation.mutateAsync(entryData);
      }
    }
    // After saving, re-fetch the timesheet to get updated entries and totals
    queryClient.invalidateQueries({ queryKey: ['timesheets', timesheet.id] });
  };

  const handleRowChange = <Key extends keyof DayEntryRow>(
    rowIndex: number,
    field: Key,
    value: DayEntryRow[Key],
  ) => {
    setRows((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [field]: value };
      return next;
    });
  };

  const updateRowIntervals = (
    rowIndex: number,
    updater: (prev: DayEntryRow['intervals']) => DayEntryRow['intervals'],
  ) => {
    setRows((prev) => {
      const next = [...prev];
      const target = next[rowIndex];
      if (!target) {
        return prev;
      }
      const nextIntervals = updater(target.intervals);
      const analysis = analyzeIntervals(nextIntervals);
      next[rowIndex] = {
        ...target,
        intervals: nextIntervals,
        minutes: analysis.kind === 'ok' ? analysis.totalMinutes : 0,
      };
      return next;
    });
  };

  const handleIntervalTimeChange = (
    rowIndex: number,
    intervalIndex: number,
    field: 'start' | 'end',
    value: string,
  ) => {
    const trimmed = value.trim();
    updateRowIntervals(rowIndex, (prevIntervals) => {
      const next = [...prevIntervals];
      const current = next[intervalIndex] ?? { start: '', end: '' };
      if (field === 'start') {
        const currentStart = splitMeridianTime(current.start);
        const nextStart = trimmed ? buildMeridianTime(trimmed, currentStart.period) : '';
        const adjustedStart = ensureMeridianTime(nextStart);
        const startPeriod = splitMeridianTime(adjustedStart).period;
        const currentEndSplit = splitMeridianTime(current.end);
        let nextEnd = current.end;
        if (startPeriod === 'PM' && currentEndSplit.period === 'AM') {
          nextEnd = currentEndSplit.time ? buildMeridianTime(currentEndSplit.time, 'PM') : '';
        }
        next[intervalIndex] = {
          start: adjustedStart,
          end: ensureMeridianTime(nextEnd),
        };
      } else {
        const startSplit = splitMeridianTime(current.start);
        const currentEndSplit = splitMeridianTime(current.end);
        const enforcedPeriod: Meridian = startSplit.period === 'PM' ? 'PM' : currentEndSplit.period;
        const nextEnd = trimmed ? buildMeridianTime(trimmed, enforcedPeriod) : '';
        next[intervalIndex] = {
          start: ensureMeridianTime(current.start),
          end: ensureMeridianTime(nextEnd),
        };
      }
      return next;
    });
  };

  const handleIntervalPeriodChange = (
    rowIndex: number,
    intervalIndex: number,
    field: 'start' | 'end',
    period: Meridian,
  ) => {
    updateRowIntervals(rowIndex, (prevIntervals) => {
      const next = [...prevIntervals];
      const current = next[intervalIndex] ?? { start: '', end: '' };
      if (field === 'start') {
        const startSplit = splitMeridianTime(current.start);
        const nextStart = startSplit.time ? buildMeridianTime(startSplit.time, period) : '';
        const endSplit = splitMeridianTime(current.end);
        let nextEnd = current.end;
        if (period === 'PM' && endSplit.period === 'AM') {
          nextEnd = endSplit.time ? buildMeridianTime(endSplit.time, 'PM') : '';
        }
        next[intervalIndex] = {
          start: ensureMeridianTime(nextStart),
          end: ensureMeridianTime(nextEnd),
        };
      } else {
        const startSplit = splitMeridianTime(current.start);
        const enforcedPeriod: Meridian = startSplit.period === 'PM' ? 'PM' : period;
        const endSplit = splitMeridianTime(current.end);
        const nextEnd = endSplit.time ? buildMeridianTime(endSplit.time, enforcedPeriod) : '';
        next[intervalIndex] = {
          start: ensureMeridianTime(current.start),
          end: ensureMeridianTime(nextEnd),
        };
      }
      return next;
    });
  };

  const handleAddIntervalToRow = (rowIndex: number) => {
    updateRowIntervals(rowIndex, (prevIntervals) => [...prevIntervals, { start: '', end: '' }]);
  };

  const handleRemoveIntervalFromRow = (rowIndex: number, intervalIndex: number) => {
    updateRowIntervals(rowIndex, (prevIntervals) =>
      prevIntervals.filter((_, idx) => idx !== intervalIndex),
    );
  };

  const handleAddRow = () => {
    if (locked) return;
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (locked) return;
    setRows((prev) =>
      prev.length === 1 ? [createEmptyRow()] : prev.filter((_, idx) => idx !== rowIndex),
    );
  };

  const previousDate = currentIndex > 0 ? weekDates[currentIndex - 1] : null;
  const nextDate = currentIndex < weekDates.length - 1 ? weekDates[currentIndex + 1] : null;

  return (
    <Stack spacing={2.5}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            aria-label="Previous day"
            onClick={() => previousDate && onChangeDate(previousDate)}
            size="small"
            disabled={!previousDate}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
          <Typography variant="h6">{formatDayLabel(date)}</Typography>
          <IconButton
            aria-label="Next day"
            onClick={() => nextDate && onChangeDate(nextDate)}
            size="small"
            disabled={!nextDate}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box>

        <Chip
          label={timesheet?.status ?? 'DRAFT'}
          color={
            timesheet?.status === 'REJECTED'
              ? 'error'
              : timesheet?.status === 'SUBMITTED'
                ? 'warning'
                : 'success'
          }
          variant="filled"
        />
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <Stack spacing={3}>
          {locked && (
            <Alert
              severity={readOnly ? 'info' : 'warning'}
              sx={{ alignSelf: 'flex-start', width: '100%' }}
            >
              {readOnly
                ? 'This week is locked for editing. Contact your manager for changes.'
                : 'Weekend work requires manager approval before you can log time.'}
            </Alert>
          )}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Entries</Typography>
            {!rows.length && (
              <Button
                variant="text"
                startIcon={<Add />}
                onClick={handleAddRow}
                size="small"
                aria-label="Add entry"
                disabled={locked}
              >
                Add row
              </Button>
            )}
          </Box>

          {!rows.length ? (
            <Typography variant="body2" color="text.secondary">
              No hours done.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {rows.map((row, index) => (
                <PaperRow
                  key={row.internalId}
                  row={row}
                  index={index}
                  actionCodes={actionCodes}
                  onDelete={() => handleRemoveRow(index)}
                  onFieldChange={handleRowChange}
                  onAddInterval={handleAddIntervalToRow}
                  onIntervalTimeChange={handleIntervalTimeChange}
                  onIntervalPeriodChange={handleIntervalPeriodChange}
                  onRemoveInterval={handleRemoveIntervalFromRow}
                  disabled={locked}
                  disabledCodes={
                    rows
                      .filter((_, idx) => idx !== index)
                      .map((item) => item.actionCodeId)
                      .filter(Boolean) as ActionCode['id'][]
                  }
                  accentColor={
                    row.actionCodeId
                      ? codeById.get(row.actionCodeId as ActionCode['id'])?.color
                      : undefined
                  }
                />
              ))}
            </Stack>
          )}

          <Divider />

          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">Day total</Typography>
              <Typography variant="h5">
                {formatMinutes(rows.reduce((sum, row) => sum + row.minutes, 0))}
              </Typography>
            </Stack>
            <Stack spacing={0.5} textAlign={{ xs: 'left', sm: 'right' }}>
              <Typography variant="subtitle2">Required minimum</Typography>
              <Typography variant="body1">{formatMinutes(dailyMin)}</Typography>
              {rows.reduce((sum, row) => sum + row.minutes, 0) < dailyMin && (
                <Typography variant="caption" color="warning.main">
                  Short by{' '}
                  {formatMinutes(dailyMin - rows.reduce((sum, row) => sum + row.minutes, 0))}
                </Typography>
              )}
              {rows.reduce((sum, row) => sum + row.minutes, 0) > dailyMin && (
                <Typography variant="caption" color="success.main">
                  +{formatMinutes(rows.reduce((sum, row) => sum + row.minutes, 0) - dailyMin)}{' '}
                  overtime
                </Typography>
              )}
              {rows.reduce((sum, row) => sum + row.minutes, 0) > MAX_DAY_MINUTES && (
                <Typography variant="caption" color="error.main">
                  Cannot exceed 24h (1440 minutes)
                </Typography>
              )}
            </Stack>
          </Box>

          {rows.reduce((sum, row) => sum + row.minutes, 0) < dailyMin && (
            <TextField
              label="Reason for deficit"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              helperText={
                reason.length > 0 && reason.length < 10
                  ? 'Minimum 10 characters required.'
                  : 'Minimum 10 characters. Saved with this day.'
              }
              error={reason.length > 0 && reason.length < 10}
              multiline
              required
              disabled={locked}
            />
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveDayEntries}
              disabled={
                locked ||
                createEntryMutation.isPending ||
                updateEntryMutation.isPending ||
                deleteEntryMutation.isPending
              }
            >
              Save Day Entries
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Summary
        </Typography>
        {rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hours done.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {rows.map((item) => (
              <Stack
                key={`${item.actionCodeId}-${item.country}-${item.minutes}`}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
                spacing={1}
              >
                <Stack spacing={0.5}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor:
                          codeById.get(item.actionCodeId as ActionCode['id'])?.color ??
                          theme.palette.text.disabled,
                        border: `1px solid ${alpha(theme.palette.common.black, 0.12)}`,
                      }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {codeById.get(item.actionCodeId as ActionCode['id'])?.name}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {item.country}
                  </Typography>
                  {item.intervals?.length ? (
                    <Typography variant="caption" color="text.secondary">
                      {formatIntervals(item.intervals)}
                    </Typography>
                  ) : null}
                  {item.note && (
                    <Typography variant="caption" color="text.secondary">
                      {item.note}
                    </Typography>
                  )}
                </Stack>
                <Typography variant="body2">{formatMinutes(item.minutes)}</Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
};

interface PaperRowProps {
  row: DayEntryRow;
  index: number;
  actionCodes: ActionCode[];
  onDelete: () => void;
  onFieldChange: <Key extends keyof DayEntryRow>(
    rowIndex: number,
    field: Key,
    value: DayEntryRow[Key],
  ) => void;
  onAddInterval: (rowIndex: number) => void;
  onIntervalTimeChange: (
    rowIndex: number,
    intervalIndex: number,
    field: 'start' | 'end',
    value: string,
  ) => void;
  onIntervalPeriodChange: (
    rowIndex: number,
    intervalIndex: number,
    field: 'start' | 'end',
    period: Meridian,
  ) => void;
  onRemoveInterval: (rowIndex: number, intervalIndex: number) => void;
  onRemoveFromWeek?: () => void;
  disableRemoveFromWeek?: boolean;
  accentColor?: string;
}

const PaperRow = ({
  row,
  index,
  actionCodes,
  onDelete,
  onFieldChange,
  onAddInterval,
  onIntervalTimeChange,
  onIntervalPeriodChange,
  onRemoveInterval,
  onRemoveFromWeek,
  disableRemoveFromWeek,
  disabled,
  disabledCodes,
  accentColor,
}: PaperRowProps & { disabled: boolean; disabledCodes: ActionCode['id'][] }) => {
  const theme = useTheme();
  const accent = accentColor ?? theme.palette.text.disabled;
  const borderStrength = accentColor ? 0.55 : 0.25;
  const outlineColor = accentColor ? alpha(accent, 0.2) : theme.palette.divider;
  const backgroundTint = accentColor ? alpha(accent, 0.035) : theme.palette.background.paper;
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 2,
        borderLeft: `4px solid ${alpha(accent, borderStrength)}`,
        borderColor: outlineColor,
        backgroundColor: backgroundTint,
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Autocomplete
            options={actionCodes}
            getOptionLabel={(option) => `${option.name} (${option.code})`}
            value={actionCodes.find((code) => code.id === row.actionCodeId) ?? null}
            onChange={(_, value) =>
              onFieldChange(index, 'actionCodeId', (value?.id as ActionCode['id']) ?? '')
            }
            getOptionDisabled={(option) => disabledCodes.includes(option.id)}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: option.color ?? theme.palette.text.disabled,
                    border: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
                  }}
                />
                <Stack spacing={0.25}>
                  <Typography variant="body2" fontWeight={600}>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.code}
                  </Typography>
                </Stack>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Action code"
                placeholder="DEV-2103"
                required
                disabled={disabled}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      {row.actionCodeId && (
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: accentColor ?? theme.palette.text.disabled,
                            mr: 1,
                          }}
                        />
                      )}
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Work mode"
            value={row.mode}
            onChange={(event) => onFieldChange(index, 'mode', event.target.value as WorkMode)}
            select
            required
            fullWidth
            disabled={disabled}
          >
            {Object.values(WorkMode).map((mode) => (
              <MenuItem key={mode} value={mode}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Autocomplete
            options={COUNTRIES}
            getOptionLabel={(option) => `${option.code} — ${option.name}`}
            value={COUNTRIES.find((country) => country.code === row.country) ?? COUNTRIES[0]}
            onChange={(_, option) => onFieldChange(index, 'country', option?.code ?? '')}
            renderInput={(params) => (
              <TextField {...params} label="Country" required disabled={disabled} />
            )}
            disabled={disabled}
          />
        </Grid>
        <Grid
          size={{ xs: 12, md: 2 }}
          sx={{
            display: 'flex',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Tooltip title="Remove from this day">
            <span>
              <IconButton
                aria-label="Remove row"
                onClick={onDelete}
                color="error"
                disabled={disabled}
              >
                <Delete />
              </IconButton>
            </span>
          </Tooltip>
          {row.actionCodeId && onRemoveFromWeek && (
            <Tooltip title="Remove this code from the entire week">
              <span>
                <IconButton
                  aria-label="Remove code from week"
                  onClick={onRemoveFromWeek}
                  color="error"
                  disabled={disabled || disableRemoveFromWeek}
                >
                  <DeleteForever />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Stack spacing={1.5}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              gap={1}
            >
              <Stack spacing={0.25}>
                <Typography variant="subtitle2">Intervals</Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.minutes > 0 ? `Total ${formatMinutes(row.minutes)}` : 'No time logged yet'}
                </Typography>
              </Stack>
              <Button
                size="small"
                startIcon={<Add fontSize="small" />}
                onClick={() => onAddInterval(index)}
                disabled={disabled}
              >
                Add interval
              </Button>
            </Box>
            {row.intervals.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                Add at least one interval with a start and end time.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {row.intervals.map((interval, intervalIndex) => {
                  const startSplit = splitMeridianTime(interval.start);
                  const endSplit = splitMeridianTime(interval.end);
                  const allowedEndMeridians =
                    startSplit.period === 'PM' ? (['PM'] as Meridian[]) : MERIDIANS;
                  const displayEndPeriod = allowedEndMeridians.includes(endSplit.period)
                    ? endSplit.period
                    : allowedEndMeridians[0];
                  return (
                    <Box
                      key={`${row.internalId}-interval-${intervalIndex}`}
                      display="flex"
                      flexWrap="wrap"
                      alignItems="center"
                      gap={1}
                    >
                      <TextField
                        label="Start"
                        value={startSplit.time}
                        onChange={(event) =>
                          onIntervalTimeChange(index, intervalIndex, 'start', event.target.value)
                        }
                        inputProps={{ placeholder: '09:00' }}
                        size="small"
                        disabled={disabled}
                      />
                      <TextField
                        label="AM/PM"
                        value={startSplit.period}
                        onChange={(event) =>
                          onIntervalPeriodChange(
                            index,
                            intervalIndex,
                            'start',
                            event.target.value as Meridian,
                          )
                        }
                        select
                        size="small"
                        sx={{ width: 100 }}
                        disabled={disabled}
                      >
                        {MERIDIANS.map((meridian) => (
                          <MenuItem key={meridian} value={meridian}>
                            {meridian}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="End"
                        value={endSplit.time}
                        onChange={(event) =>
                          onIntervalTimeChange(index, intervalIndex, 'end', event.target.value)
                        }
                        inputProps={{ placeholder: '10:15' }}
                        size="small"
                        disabled={disabled}
                      />
                      <TextField
                        label="AM/PM"
                        value={displayEndPeriod}
                        onChange={(event) =>
                          onIntervalPeriodChange(
                            index,
                            intervalIndex,
                            'end',
                            event.target.value as Meridian,
                          )
                        }
                        select
                        size="small"
                        sx={{ width: 100 }}
                        disabled={disabled}
                      >
                        {allowedEndMeridians.map((meridian) => (
                          <MenuItem key={meridian} value={meridian}>
                            {meridian}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Tooltip title="Remove interval">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => onRemoveInterval(index, intervalIndex)}
                            disabled={disabled}
                          >
                            <Clear fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Notes"
            value={row.note}
            onChange={(event) => onFieldChange(index, 'note', event.target.value)}
            multiline
            minRows={2}
            placeholder="Optional context"
            fullWidth
            disabled={disabled}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DayLogView;
