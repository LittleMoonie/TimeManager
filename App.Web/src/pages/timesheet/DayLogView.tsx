import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Paper,
  Grid,
  Tooltip,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Add, ChevronLeft, ChevronRight, Delete, DeleteForever } from '@mui/icons-material';
import { COUNTRIES } from '@/constants/countries';
import type {
  ActionCode,
  ActionCodeId,
  CellEntry,
  ISODate,
  Timesheet,
  WorkMode,
} from '@/types';
import {
  formatDayLabel,
  formatMinutes,
  getWeekDates,
  parseDuration,
  toISODate,
  formatIntervals,
  analyzeIntervals,
} from './utils';
import { isWeekend } from 'date-fns';

type DayEntryRow = {
  internalId: string;
  code: ActionCodeId | '';
  minutes: number;
  durationText: string;
  mode: WorkMode;
  country: string;
  note: string;
  intervals: { start: string; end: string }[];
  existing: boolean;
  sent?: boolean;
  deficitReason?: string;
};

interface DayLogViewProps {
  date: Date;
  timesheet?: Timesheet;
  actionCodes: ActionCode[];
  onChangeDate: (date: Date) => void;
  onSaveDay: (params: {
    dateISO: ISODate;
    rows: DayEntryRow[];
    deficitReason?: string;
  }) => Promise<void>;
  onRemoveActionCode: (code: ActionCodeId) => Promise<void>;
  dailyMin: number;
  weekStart: Date;
  isSaving?: boolean;
  readOnly: boolean;
  weekendOverrides: ISODate[];
  isRemovingActionCode?: boolean;
}

const MAX_DAY_MINUTES = 24 * 60;

const createRowFromEntry = (code: ActionCodeId, entry: CellEntry): DayEntryRow => ({
  internalId: `${code}-${entry.location.mode}-${entry.location.country}`,
  code,
  minutes: entry.minutes,
  durationText: formatMinutes(entry.minutes),
  mode: entry.location.mode,
  country: entry.location.country,
  note: entry.note ?? '',
  intervals: entry.intervals ?? [],
  existing: true,
  sent: entry.sent,
  deficitReason: entry.deficitReason,
});

const createEmptyRow = (): DayEntryRow => ({
  internalId: crypto.randomUUID(),
  code: '',
  minutes: 0,
  durationText: '',
  mode: 'Office',
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
  onSaveDay,
  onRemoveActionCode,
  dailyMin,
  weekStart,
  isSaving,
  readOnly,
  weekendOverrides,
  isRemovingActionCode,
}: DayLogViewProps) => {
  const theme = useTheme();
  const [rows, setRows] = useState<DayEntryRow[]>([createEmptyRow()]);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [dayError, setDayError] = useState<string | null>(null);

  const dateISO = toISODate(date);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const currentIndex = weekDates.findIndex((day) => toISODate(day) === dateISO);

  const codeById = useMemo(() => {
    const map = new Map<ActionCodeId, ActionCode>();
    actionCodes.forEach((code) => map.set(code.id, code));
    return map;
  }, [actionCodes]);

  useEffect(() => {
    if (!timesheet) return;
    const dayRows: DayEntryRow[] = [];

    Object.entries(timesheet.entries).forEach(([code, dayMap]) => {
      const entry = dayMap[dateISO];
      if (entry) {
        dayRows.push(createRowFromEntry(code, entry));
      }
    });

    setRows(dayRows.length ? dayRows : [createEmptyRow()]);
    setReason('');
  }, [timesheet, dateISO]);

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

  const handleMinutesBlur = (rowIndex: number, rawValue: string) => {
    const parsed = parseDuration(rawValue);
    if (parsed === null) return;
    setRows((prev) => {
      const next = [...prev];
      next[rowIndex] = {
        ...next[rowIndex],
        minutes: parsed,
        durationText: formatMinutes(parsed),
      };
      return next;
    });
  };

  const handleAddRow = () => {
    if (locked) return;
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (locked) return;
    setRows((prev) => (prev.length === 1 ? [createEmptyRow()] : prev.filter((_, idx) => idx !== rowIndex)));
  };

  const handleRemoveCodeFromWeek = async (codeId: ActionCodeId) => {
    if (locked || isRemovingActionCode) return;
    try {
      await onRemoveActionCode(codeId);
      setRows((prev) => {
        const filtered = prev.filter((row) => row.code !== codeId);
        return filtered.length ? filtered : [createEmptyRow()];
      });
    } catch (error) {
      console.error(error);
    }
  };

  const dayTotal = useMemo(
    () => rows.reduce((total, row) => total + (Number.isFinite(row.minutes) ? row.minutes : 0), 0),
    [rows],
  );

  useEffect(() => {
    if (dayError && dayTotal <= MAX_DAY_MINUTES) {
      setDayError(null);
    }
  }, [dayError, dayTotal]);

  const weekendOverrideSet = useMemo(() => new Set(weekendOverrides), [weekendOverrides]);
  const isWeekendDay = isWeekend(date);
  const weekendLocked = isWeekendDay && !weekendOverrideSet.has(dateISO);
  const locked = readOnly || weekendLocked;

  const summary = useMemo(
    () =>
      rows
        .filter((row) => row.code && row.minutes > 0)
        .map((row) => ({
          code: row.code,
          minutes: row.minutes,
          note: row.note,
          location: `${row.mode} · ${row.country}`,
          color: row.code ? codeById.get(row.code as ActionCodeId)?.color : undefined,
          intervals: row.intervals,
        })),
    [rows, codeById],
  );

  const status = useMemo(() => {
    if (dayTotal === 0) return { label: 'Draft', color: 'default' as const };
    if (dayTotal < dailyMin) return { label: 'Deficit', color: 'warning' as const };
    if (dayTotal > dailyMin) return { label: 'Overtime', color: 'success' as const };
    return { label: 'OK', color: 'primary' as const };
  }, [dayTotal, dailyMin]);

  const deficitRequiresReason = dayTotal < dailyMin;
  const isReasonInvalid = deficitRequiresReason && reason.trim().length < 10;
  const exceedsDayCap = dayTotal > MAX_DAY_MINUTES;

  const handleSave = async () => {
    if (locked) return;
    const normalizedRows = rows.map((row) => {
      const intervalAnalysis = analyzeIntervals(row.intervals);
      if (intervalAnalysis.kind === 'ok') {
        const total = intervalAnalysis.totalMinutes;
        return {
          ...row,
          minutes: total,
          durationText: formatMinutes(total),
        };
      }

      const parsed = parseDuration(row.durationText || `${row.minutes}`);
      if (parsed === null) {
        return row;
      }
      return {
        ...row,
        minutes: parsed,
        durationText: formatMinutes(parsed),
      };
    });

    setRows(normalizedRows);

    const cleanRows = normalizedRows.filter((row) => row.code && row.minutes > 0);
    if (!cleanRows.length) {
      return;
    }

    const normalizedTotal = cleanRows.reduce((total, row) => total + row.minutes, 0);

    if (normalizedTotal > MAX_DAY_MINUTES) {
      setDayError('Logged time cannot exceed 24h (1440 minutes) for a single day.');
      return;
    }

    if (normalizedTotal < dailyMin) {
      if (reason.trim().length < 10) {
        setReasonError('Please provide at least 10 characters explaining the deficit.');
        return;
      }
    }

    setReasonError(null);
    setDayError(null);

    await onSaveDay({
      dateISO,
      rows: cleanRows,
      deficitReason: normalizedTotal < dailyMin ? reason.trim() : undefined,
    });
  };

  const previousDate = currentIndex > 0 ? weekDates[currentIndex - 1] : null;
  const nextDate = currentIndex < weekDates.length - 1 ? weekDates[currentIndex + 1] : null;

  return (
    <Stack spacing={2.5}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
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

        <Chip label={status.label} color={status.color} variant="filled" />
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
            </Box>

            <Stack spacing={2}>
              {rows.map((row, index) => (
                <PaperRow
                  key={row.internalId}
                  row={row}
                  index={index}
                  actionCodes={actionCodes}
                  onDelete={() => handleRemoveRow(index)}
                  onFieldChange={handleRowChange}
                  onDurationBlur={handleMinutesBlur}
                  disabled={locked}
                  disabledCodes={rows
                    .filter((_, idx) => idx !== index)
                    .map((item) => item.code)
                    .filter(Boolean) as ActionCodeId[]}
                  onRemoveFromWeek={
                    row.code ? () => handleRemoveCodeFromWeek(row.code as ActionCodeId) : undefined
                  }
                  disableRemoveFromWeek={Boolean(isRemovingActionCode)}
                  accentColor={row.code ? codeById.get(row.code as ActionCodeId)?.color : undefined}
                />
              ))}
            </Stack>

            <Divider />

            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Day total</Typography>
                <Typography variant="h5">{formatMinutes(dayTotal)}</Typography>
              </Stack>
              <Stack spacing={0.5} textAlign={{ xs: 'left', sm: 'right' }}>
                <Typography variant="subtitle2">Required minimum</Typography>
                <Typography variant="body1">{formatMinutes(dailyMin)}</Typography>
                {dayTotal < dailyMin && (
                  <Typography variant="caption" color="warning.main">
                    Short by {formatMinutes(dailyMin - dayTotal)}
                  </Typography>
                )}
                {dayTotal > dailyMin && (
                  <Typography variant="caption" color="success.main">
                    +{formatMinutes(dayTotal - dailyMin)} overtime
                  </Typography>
                )}
                {dayTotal > MAX_DAY_MINUTES && (
                  <Typography variant="caption" color="error.main">
                    Cannot exceed 24h (1440 minutes)
                  </Typography>
                )}
              </Stack>
            </Box>

            {dayTotal < dailyMin && (
              <TextField
                label="Reason for deficit"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                helperText={reasonError ?? 'Minimum 10 characters. Saved with this day.'}
                error={Boolean(reasonError)}
                multiline
                required
                disabled={locked}
              />
            )}

            {dayError && (
              <Typography variant="caption" color="error">
                {dayError}
              </Typography>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
                disabled={locked || isSaving || isReasonInvalid || exceedsDayCap}
              >
                Save day
              </Button>
            </Stack>
          </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Summary
          </Typography>
          {summary.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nothing logged yet.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {summary.map((item) => (
                <Stack
                  key={`${item.code}-${item.location}-${item.minutes}`}
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
                          backgroundColor: item.color ?? theme.palette.text.disabled,
                          border: `1px solid ${alpha(theme.palette.common.black, 0.12)}`,
                        }}
                      />
                      <Typography variant="body2" fontWeight={600}>
                        {item.code}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {item.location}
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
  onDurationBlur: (rowIndex: number, value: string) => void;
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
  onDurationBlur,
  onRemoveFromWeek,
  disableRemoveFromWeek,
  disabled,
  disabledCodes,
  accentColor,
}: PaperRowProps & { disabled: boolean; disabledCodes: ActionCodeId[] }) => {
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
            getOptionLabel={(option) => `${option.id} — ${option.label}`}
            value={actionCodes.find((code) => code.id === row.code) ?? null}
            onChange={(_, value) => onFieldChange(index, 'code', value?.id ?? '')}
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
                    {option.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.label}
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
                      {row.code && (
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
        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            label="Duration"
            value={row.durationText}
            onChange={(event) => onFieldChange(index, 'durationText', event.target.value)}
            onBlur={(event) => onDurationBlur(index, event.target.value)}
            helperText="Supports 1h30, 90m, 1:30"
            required
            inputProps={{ inputMode: 'decimal' }}
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            label="Work mode"
            value={row.mode}
            onChange={(event) => onFieldChange(index, 'mode', event.target.value as WorkMode)}
            select
            required
            fullWidth
            disabled={disabled}
          >
            <MenuItem value="Office">Office</MenuItem>
            <MenuItem value="Homeworking">Homeworking</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Autocomplete
            options={COUNTRIES}
            getOptionLabel={(option) => `${option.code} — ${option.name}`}
            value={COUNTRIES.find((country) => country.code === row.country) ?? COUNTRIES[0]}
            onChange={(_, option) => onFieldChange(index, 'country', option?.code ?? '')}
            renderInput={(params) => <TextField {...params} label="Country" required disabled={disabled} />}
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
          {row.code && onRemoveFromWeek && (
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
