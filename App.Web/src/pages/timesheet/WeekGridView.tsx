import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  ChevronLeft,
  ChevronRight,
  Clear,
  ContentCopy,
  Edit,
  ErrorOutline,
  NoteAdd,
  Save,
  DeleteForever,
  CalendarViewWeek,
  Close,
} from '@mui/icons-material';
import { COUNTRIES } from '@/constants/countries';
import type {
  ActionCode,
  ActionCodeId,
  CellEntry,
  ISODate,
  Timesheet,
  WorkMode,
} from '@/types';
import { alpha, useTheme } from '@mui/material/styles';
import { addWeeks, isAfter, isWeekend, parseISO } from 'date-fns';
import {
  analyzeIntervals,
  type IntervalAnalysis,
  formatDayLabel,
  formatIntervals,
  formatMinutes,
  formatWeekRange,
  getWeekDates,
  toISODate,
} from './utils';

type QuickIncrement = 5 | 15 | 30 | 60;

const QUICK_INCREMENTS: QuickIncrement[] = [5, 15, 30, 60];

interface CellEditorState {
  minutes: number;
  mode: WorkMode;
  country: string;
  note: string;
  intervals: { start: string; end: string }[];
}

const MAX_DAY_MINUTES = 24 * 60;

interface WeekGridViewProps {
  weekStart: Date;
  timesheet?: Timesheet;
  actionCodeRows: ActionCode[];
  selectedDate: Date;
  onViewDay: (date: Date) => void;
  onNavigateWeek: (direction: number) => void;
  onAddActionCode: (actionCode: ActionCode) => void;
  availableCodes: ActionCode[];
  onUpdateCell: (params: {
    code: ActionCodeId;
    dateISO: ISODate;
    entry: CellEntry;
  }) => Promise<void>;
  onClearCell: (code: ActionCodeId, dateISO: ISODate) => Promise<void>;
  onDuplicateForward: (params: {
    targetDateISO: ISODate;
    code: ActionCodeId;
    entry: CellEntry;
  }) => Promise<void>;
  onRemoveActionCode: (code: ActionCodeId) => Promise<void>;
  dailyTotals: Record<ISODate, number>;
  weeklyTotal: number;
  weeklyMin: number;
  dailyMin: number;
  isSubmitting?: boolean;
  readOnly: boolean;
  weekendOverrides: ISODate[];
  currentWeekStart: Date;
}

const defaultEditorState = (entry?: CellEntry): CellEditorState => ({
  minutes: entry?.minutes ?? 0,
  mode: entry?.location.mode ?? 'Office',
  country: entry?.location.country ?? 'US',
  note: entry?.note ?? '',
  intervals: entry?.intervals ?? [],
});

const hasEditorContent = (state: CellEditorState) => {
  if (state.minutes > 0) {
    return true;
  }
  if (state.note.trim().length > 0) {
    return true;
  }
  return state.intervals.some(
    (interval) => interval.start.trim().length > 0 || interval.end.trim().length > 0,
  );
};

const computeDayMinutes = (
  timesheet: Timesheet | undefined,
  dateISO: ISODate,
  excludeCode?: ActionCodeId,
) => {
  if (!timesheet) return 0;
  return Object.entries(timesheet.entries).reduce((total, [code, dayMap]) => {
    if (excludeCode && code === excludeCode) {
      return total;
    }
    const cell = dayMap?.[dateISO];
    return total + (cell?.minutes ?? 0);
  }, 0);
};

const INTERVAL_INVALID_ERROR =
  'Intervals must be valid HH:MM ranges with the end time after the start.';
const INTERVAL_INCOMPLETE_ERROR = 'Complete both start and end times for each interval.';

const getCellEntry = (timesheet: Timesheet | undefined, code: ActionCodeId, dateISO: ISODate) =>
  timesheet?.entries?.[code]?.[dateISO];

export const WeekGridView = ({
  weekStart,
  timesheet,
  actionCodeRows,
  selectedDate,
  onViewDay,
  onNavigateWeek,
  onAddActionCode,
  availableCodes,
  onUpdateCell,
  onClearCell,
  onDuplicateForward,
  onRemoveActionCode,
  dailyTotals,
  weeklyTotal,
  weeklyMin,
  dailyMin,
  isSubmitting,
  readOnly,
  weekendOverrides,
  currentWeekStart,
}: WeekGridViewProps) => {
  const theme = useTheme();
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const weekendOverrideSet = useMemo(() => new Set(weekendOverrides), [weekendOverrides]);
  const nextWeekStart = useMemo(() => addWeeks(weekStart, 1), [weekStart]);
  const disableNextWeek = useMemo(
    () => isAfter(nextWeekStart, currentWeekStart),
    [nextWeekStart, currentWeekStart],
  );
  const [addCodeOpen, setAddCodeOpen] = useState(false);
  const [cellAnchor, setCellAnchor] = useState<HTMLElement | null>(null);
  const [editingKey, setEditingKey] = useState<{ code: ActionCodeId; dateISO: ISODate } | null>(
    null,
  );
  const [editorState, setEditorState] = useState<CellEditorState>(defaultEditorState());
  const [error, setError] = useState<string | null>(null);
  const [removalTarget, setRemovalTarget] = useState<ActionCode | null>(null);
  const [isRemovingCode, setIsRemovingCode] = useState(false);
  const [removalError, setRemovalError] = useState<string | null>(null);

  const entryLimit = useMemo(() => {
    if (!editingKey) return MAX_DAY_MINUTES;
    const { dateISO, code } = editingKey;
    const otherMinutes = computeDayMinutes(timesheet, dateISO, code);
    return Math.max(0, MAX_DAY_MINUTES - otherMinutes);
  }, [timesheet, editingKey]);

  const exceedsDayLimit = (dateISO: ISODate, minutes: number, code: ActionCodeId) => {
    const otherMinutes = computeDayMinutes(timesheet, dateISO, code);
    return otherMinutes + Math.max(0, minutes) > MAX_DAY_MINUTES;
  };

  useEffect(() => {
    if (readOnly && addCodeOpen) {
      setAddCodeOpen(false);
    }
  }, [readOnly, addCodeOpen]);

  useEffect(() => {
    if (error === 'Add time, notes, or intervals before saving.' && hasEditorContent(editorState)) {
      setError(null);
    }
  }, [editorState, error]);

  const applyIntervalsUpdate = useCallback(
    (updater: (prev: CellEditorState['intervals']) => CellEditorState['intervals']) => {
      let analysis: IntervalAnalysis = { kind: 'empty' };
      setEditorState((prev) => {
        const nextIntervals = updater(prev.intervals);
        analysis = analyzeIntervals(nextIntervals);
        const nextState: CellEditorState = { ...prev, intervals: nextIntervals };
        if (analysis.kind === 'ok') {
          nextState.minutes = analysis.totalMinutes;
        }
        return nextState;
      });

      if (analysis.kind === 'invalid') {
        setError(INTERVAL_INVALID_ERROR);
      } else if (analysis.kind === 'partial') {
        setError(INTERVAL_INCOMPLETE_ERROR);
      } else {
        setError((prevError) =>
          prevError === INTERVAL_INVALID_ERROR || prevError === INTERVAL_INCOMPLETE_ERROR
            ? null
            : prevError,
        );
      }
    },
    [setError],
  );

  const handleRequestRemoveCode = (code: ActionCode) => {
    if (readOnly) return;
    setRemovalTarget(code);
    setRemovalError(null);
  };

  const handleCloseRemoveDialog = () => {
    if (isRemovingCode) return;
    setRemovalTarget(null);
    setRemovalError(null);
  };

  const handleConfirmRemoveCode = async () => {
    if (!removalTarget) return;
    setIsRemovingCode(true);
    setRemovalError(null);
    try {
      await onRemoveActionCode(removalTarget.id);
      setRemovalTarget(null);
    } catch (err) {
      console.error(err);
      setRemovalError('Failed to remove action code. Please try again.');
    } finally {
      setIsRemovingCode(false);
    }
  };

  const handleOpenEditor = (
    event: React.MouseEvent<HTMLElement>,
    code: ActionCodeId,
    dateISO: ISODate,
  ) => {
    if (readOnly || (isWeekend(parseISO(dateISO)) && !weekendOverrideSet.has(dateISO))) {
      return;
    }
    setCellAnchor(event.currentTarget);
    setEditingKey({ code, dateISO });
    const entry = getCellEntry(timesheet, code, dateISO);
    setEditorState(defaultEditorState(entry));
    setError(null);
  };

  const handleCloseEditor = () => {
    setCellAnchor(null);
    setEditingKey(null);
    setError(null);
  };

  const handleIntervalChange = (index: number, field: 'start' | 'end', value: string) => {
    applyIntervalsUpdate((prevIntervals) => {
      const next = [...prevIntervals];
      if (!next[index]) {
        next[index] = { start: '', end: '' };
      }
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const handleAddInterval = () => {
    applyIntervalsUpdate((prevIntervals) => [...prevIntervals, { start: '', end: '' }]);
  };

  const handleRemoveInterval = (index: number) => {
    applyIntervalsUpdate((prevIntervals) => prevIntervals.filter((_, idx) => idx !== index));
  };

  const handleQuickAdd = (increment: QuickIncrement) => {
    setEditorState((prev) => {
      const limit = editingKey ? entryLimit : MAX_DAY_MINUTES;
      const nextMinutes = Math.min(limit, Math.max(0, prev.minutes + increment));
      return {
        ...prev,
        minutes: nextMinutes,
      };
    });
  };

  const handleSaveCell = async () => {
    if (!editingKey) return;
    if (!editorState.country) {
      setError('Country is required');
      return;
    }
    if (!editorState.mode) {
      setError('Work mode is required');
      return;
    }

    if (!hasEditorContent(editorState)) {
      setError('Add time, notes, or intervals before saving.');
      return;
    }

    const intervalAnalysis = analyzeIntervals(editorState.intervals);
    if (intervalAnalysis.kind === 'invalid') {
      setError(INTERVAL_INVALID_ERROR);
      return;
    }
    if (intervalAnalysis.kind === 'partial') {
      setError(INTERVAL_INCOMPLETE_ERROR);
      return;
    }

    const nextMinutes =
      intervalAnalysis.kind === 'ok'
        ? intervalAnalysis.totalMinutes
        : Math.max(0, editorState.minutes);
    if (exceedsDayLimit(editingKey.dateISO, nextMinutes, editingKey.code)) {
      setError('Day total cannot exceed 24h (1440 minutes).');
      return;
    }

    const entry: CellEntry = {
      minutes: nextMinutes,
      note: editorState.note || undefined,
      intervals: editorState.intervals.length ? editorState.intervals : undefined,
      location: {
        mode: editorState.mode,
        country: editorState.country,
      },
      sent: getCellEntry(timesheet, editingKey.code, editingKey.dateISO)?.sent ?? false,
      deficitReason: getCellEntry(timesheet, editingKey.code, editingKey.dateISO)?.deficitReason,
    };

    await onUpdateCell({
      code: editingKey.code,
      dateISO: editingKey.dateISO,
      entry,
    });
    handleCloseEditor();
  };

  const handleClearCell = async () => {
    if (!editingKey) return;
    await onClearCell(editingKey.code, editingKey.dateISO);
    handleCloseEditor();
  };

  const handleDuplicateNext = async () => {
    if (!editingKey) return;
    const currentIndex = weekDates.findIndex(
      (date) => toISODate(date) === editingKey.dateISO,
    );
    if (currentIndex === -1 || currentIndex === weekDates.length - 1) {
      setError('No next day available in this week');
      return;
    }
    const nextDateISO = toISODate(weekDates[currentIndex + 1]);
    if (readOnly || (isWeekend(parseISO(nextDateISO)) && !weekendOverrideSet.has(nextDateISO))) {
      setError('Next day is locked.');
      return;
    }
    const copyMinutes = Math.max(0, editorState.minutes);
    if (exceedsDayLimit(nextDateISO, copyMinutes, editingKey.code)) {
      setError('Copying would exceed 24h for the next day.');
      return;
    }

    const entry: CellEntry = {
      minutes: copyMinutes,
      note: editorState.note || undefined,
      intervals: editorState.intervals.length ? editorState.intervals : undefined,
      location: {
        mode: editorState.mode,
        country: editorState.country,
      },
    };

    await onDuplicateForward({
      targetDateISO: nextDateISO,
      code: editingKey.code,
      entry,
    });
    setError(null);
  };

  const handleDuplicateWeek = async () => {
    if (!editingKey) return;
    const eligibleDates = weekDates
      .map((date) => ({ date, iso: toISODate(date) }))
      .filter(({ iso }) => iso !== editingKey.dateISO)
      .filter(
        ({ date, iso }) =>
          !(isWeekend(date) && !weekendOverrideSet.has(iso)),
      );
    if (!eligibleDates.length) {
      setError('No eligible days available in this week.');
      return;
    }
    const copyMinutes = Math.max(0, editorState.minutes);
    const blockedDates = eligibleDates.filter(({ iso }) =>
      exceedsDayLimit(iso, copyMinutes, editingKey.code),
    );
    if (blockedDates.length) {
      setError('Copying would exceed 24h for one or more days in this week.');
      return;
    }

    const entry: CellEntry = {
      minutes: copyMinutes,
      note: editorState.note || undefined,
      intervals: editorState.intervals.length ? editorState.intervals : undefined,
      location: {
        mode: editorState.mode,
        country: editorState.country,
      },
    };

    try {
      for (const target of eligibleDates) {
        await onDuplicateForward({
          targetDateISO: target.iso,
          code: editingKey.code,
          entry,
        });
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Unable to copy to the entire week. Please try again.');
    }
  };

  const rowTotals = useMemo(() => {
    if (!timesheet) return {};
    return Object.entries(timesheet.entries).reduce<Record<ActionCodeId, number>>(
      (acc, [code, dayMap]) => {
        acc[code as ActionCodeId] = Object.values(dayMap).reduce(
          (sum, entry) => sum + (entry?.minutes ?? 0),
          0,
        );
        return acc;
      },
      {},
    );
  }, [timesheet]);

  const footerTotals = useMemo(() => {
    const weekMinutes = weeklyTotal;
    const deficit = Math.max(0, weeklyMin - weekMinutes);
    const overtime = Math.max(0, weekMinutes - weeklyMin);
    return { weekMinutes, deficit, overtime };
  }, [weeklyTotal, weeklyMin]);

  const [codeInput, setCodeInput] = useState('');
  const canSave = useMemo(() => {
    if (!editorState.country.trim() || !editorState.mode) {
      return false;
    }
    if (!hasEditorContent(editorState)) {
      return false;
    }
    if (editingKey) {
      return editorState.minutes <= entryLimit;
    }
    return true;
  }, [editorState, entryLimit, editingKey]);

  return (
    <Stack spacing={2.5}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton
            aria-label="Previous week"
            onClick={() => onNavigateWeek(-1)}
            size="small"
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
        <Typography variant="subtitle1">{formatWeekRange(weekStart)}</Typography>
          <IconButton
            aria-label="Next week"
            onClick={() => onNavigateWeek(1)}
            size="small"
            disabled={disableNextWeek}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
      </Box>

        <Box display="flex" gap={1}>
          <Button
            variant={addCodeOpen ? 'contained' : 'outlined'}
            startIcon={<Add />}
            onClick={() => {
              if (readOnly) return;
              setAddCodeOpen((prev) => !prev);
            }}
            aria-expanded={addCodeOpen}
            aria-controls="add-action-code-panel"
            disabled={readOnly}
          >
            Add action code
          </Button>
        </Box>
      </Box>

      {addCodeOpen && !readOnly && (
        <Paper
          id="add-action-code-panel"
          variant="outlined"
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 2,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Stack spacing={2.5}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              flexWrap="wrap"
              gap={1.5}
            >
              <Box>
                <Typography variant="subtitle1">Add an action code to this week</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pick a code to track across the grid. You can adjust the hours for each day afterward.
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<Close fontSize="small" />}
                onClick={() => setAddCodeOpen(false)}
                aria-label="Close add action code panel"
              >
                Close
              </Button>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Autocomplete
                sx={{ flex: 1, minWidth: 280 }}
                options={availableCodes}
                groupBy={(option) => option.project ?? 'General'}
                getOptionLabel={(option) => `${option.id} — ${option.label}`}
                inputValue={codeInput}
                onInputChange={(_, value) => setCodeInput(value)}
                onChange={(_, value) => {
                  if (value) {
                    onAddActionCode(value);
                    setCodeInput('');
                    setAddCodeOpen(false);
                  }
                }}
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
                    placeholder="Search or type (e.g., DEV-2103)"
                    helperText="Codes follow pattern ABCD-1234"
                  />
                )}
                filterOptions={(options, state) =>
                  options.filter(
                    (option) =>
                      option.id.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                      option.label.toLowerCase().includes(state.inputValue.toLowerCase()),
                  )
                }
              />
            </Stack>
          </Stack>
        </Paper>
      )}

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: theme.palette.divider,
          boxShadow: theme.shadows[1],
        }}
      >
        <Table size="small" aria-label="Week timesheet grid">
          <TableHead>
            <TableRow>
              <TableCell>Action code</TableCell>
              {weekDates.map((date) => {
                const iso = toISODate(date);
                const total = dailyTotals[iso] ?? 0;
                const isActive = toISODate(selectedDate) === iso;
                const isDeficit = total > 0 && total < dailyMin;
                return (
                  <TableCell key={iso} align="center">
                    <Stack spacing={0.5} alignItems="center">
                      <Typography variant="subtitle2">{formatDayLabel(date)}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {total ? formatMinutes(total) : '—'}
                      </Typography>
                      {isDeficit && (
                <Typography variant="caption" color="warning.main">
                  -{formatMinutes(dailyMin - total)}
                </Typography>
              )}
              <Link
                component="button"
                variant="caption"
                underline={isActive ? 'always' : 'hover'}
                onClick={() => onViewDay(date)}
                sx={{ fontWeight: isActive ? 600 : undefined }}
              >
                View day
              </Link>
            </Stack>
          </TableCell>
                );
              })}
              <TableCell align="center">Row total</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {actionCodeRows.map((code) => {
              const accentColor = code.color ?? theme.palette.primary.main;
              return (
                <TableRow key={code.id} hover>
                <TableCell
                  sx={{
                    minWidth: 240,
                    borderLeft: `4px solid ${alpha(accentColor, 0.55)}`,
                    backgroundColor: alpha(accentColor, 0.04),
                  }}
                >
                  <Stack spacing={1}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      gap={1}
                    >
                      <Stack spacing={0.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: accentColor,
                            }}
                          />
                          <Typography variant="body2" fontWeight={600}>
                            {code.id}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {code.label}
                        </Typography>
                      </Stack>
                      <Tooltip
                        title={
                          readOnly
                            ? 'Previous weeks cannot be modified'
                            : 'Remove this code and all logged hours for the week'
                        }
                      >
                        <span>
                          <IconButton
                            edge="end"
                            size="small"
                            aria-label={`Remove ${code.id} from this week`}
                            onClick={() => handleRequestRemoveCode(code)}
                            disabled={readOnly || isSubmitting || isRemovingCode}
                          >
                            <DeleteForever fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                    {code.project && (
                      <Chip
                        label={code.project}
                        size="small"
                        sx={{
                          mt: 0.5,
                          backgroundColor: alpha(accentColor, 0.16),
                          color: accentColor,
                        }}
                      />
                    )}
                  </Stack>
                </TableCell>
                {weekDates.map((date) => {
                  const iso = toISODate(date);
                  const entry = getCellEntry(timesheet, code.id, iso);
                  const minutes = entry?.minutes ?? 0;
                  const missingLocation = entry && !entry.location?.country;
                  const sent = entry?.sent;
                  const weekendLocked = isWeekend(date) && !weekendOverrideSet.has(iso);
                  const locked = readOnly || weekendLocked;
                  return (
                    <TableCell
                      key={iso}
                      align="center"
                      sx={{
                        cursor: locked ? 'default' : 'pointer',
                        backgroundColor: weekendLocked
                          ? theme.palette.action.disabledBackground
                          : sent
                            ? alpha(accentColor, 0.14)
                            : undefined,
                        color: weekendLocked ? theme.palette.text.disabled : undefined,
                      }}
                    >
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="body2" fontWeight={500}>
                          {minutes ? formatMinutes(minutes) : '—'}
                        </Typography>
                        {entry?.location && (
                          <Typography variant="caption" color="text.secondary">
                            {entry.location.mode} · {entry.location.country}
                          </Typography>
                        )}
                        {entry?.intervals?.length ? (
                          <Typography variant="caption" color="text.secondary">
                            {formatIntervals(entry.intervals)}
                          </Typography>
                        ) : null}
                        {entry?.note && (
                          <Tooltip title={entry.note}>
                            <NoteAdd fontSize="inherit" color="action" />
                          </Tooltip>
                        )}
                        {missingLocation && (
                          <Tooltip title="Location required">
                            <ErrorOutline color="warning" fontSize="small" />
                          </Tooltip>
                        )}
                        {locked && readOnly && !weekendLocked && (
                          <Typography variant="caption" color="text.secondary">
                            Read-only week
                          </Typography>
                        )}
                        {locked ? (
                          <Tooltip title={readOnly ? 'Previous weeks are read-only' : 'Weekend requires approval'}>
                            <span>
                              <Button
                                size="small"
                                variant="text"
                                disabled
                                endIcon={<Edit fontSize="inherit" />}
                              >
                                Edit
                              </Button>
                            </span>
                          </Tooltip>
                        ) : (
                          <Button
                            size="small"
                            variant="text"
                            onClick={(event) => handleOpenEditor(event, code.id, iso)}
                            endIcon={<Edit fontSize="inherit" />}
                            aria-label={`Edit ${code.id} on ${iso}`}
                          >
                            Edit
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  );
                })}
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={600}>
                    {rowTotals[code.id] ? formatMinutes(rowTotals[code.id]) : '0m'}
                  </Typography>
                </TableCell>
                </TableRow>
              );
            })}

            {!actionCodeRows.length && (
              <TableRow>
                <TableCell colSpan={weekDates.length + 2}>
                  <Box py={5} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      No action codes yet. Use “Add action code” to start tracking time.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">Totals</Typography>
              </TableCell>
              {weekDates.map((date) => {
                const iso = toISODate(date);
                const total = dailyTotals[iso] ?? 0;
                return (
                  <TableCell key={iso} align="center">
                    <Typography variant="body2" fontWeight={600}>
                      {total ? formatMinutes(total) : '0m'}
                    </Typography>
                  </TableCell>
                );
              })}
              <TableCell align="center">
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="body2" fontWeight={600}>
                    {formatMinutes(footerTotals.weekMinutes)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Weekly min {formatMinutes(weeklyMin)}
                  </Typography>
                  {footerTotals.overtime > 0 && (
                    <Typography variant="caption" color="success.main">
                      +{formatMinutes(footerTotals.overtime)} overtime
                    </Typography>
                  )}
                  {footerTotals.deficit > 0 && (
                    <Typography variant="caption" color="warning.main">
                      -{formatMinutes(footerTotals.deficit)} deficit
                    </Typography>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(removalTarget)} onClose={handleCloseRemoveDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Remove action code</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Removing{' '}
            <Box component="span" fontWeight={600}>
              {removalTarget?.id}
            </Box>{' '}
            will clear all logged hours for this code during the selected week. This cannot be undone.
          </DialogContentText>
          {removalError && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {removalError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveDialog} disabled={isRemovingCode}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRemoveCode}
            color="error"
            variant="contained"
            disabled={isRemovingCode || isSubmitting}
          >
            {isRemovingCode ? 'Removing…' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(cellAnchor)}
        onClose={handleCloseEditor}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: { xs: 2.5, md: 3 },
            width: '100%',
          },
        }}
      >
        {editingKey && (
          <Stack spacing={3} sx={{ maxHeight: '70vh', overflowY: 'auto', pr: { xs: 0, md: 1 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">
                {editingKey.code} · {editingKey.dateISO}
              </Typography>
              <IconButton size="small" onClick={handleCloseEditor}>
                <Clear fontSize="small" />
              </IconButton>
            </Box>

            <TextField
              label="Duration (minutes)"
              value={editorState.minutes}
              type="number"
              onChange={(event) => {
                const rawValue = Number(event.target.value);
                if (Number.isNaN(rawValue)) {
                  setEditorState((prev) => ({ ...prev, minutes: 0 }));
                  return;
                }
                const limit = editingKey ? entryLimit : MAX_DAY_MINUTES;
                const clamped = Math.min(limit, Math.max(0, Math.floor(rawValue)));
                setEditorState((prev) => ({
                  ...prev,
                  minutes: clamped,
                }));
              }}
              InputProps={{
                inputProps: {
                  min: 0,
                  step: 5,
                  max: editingKey ? entryLimit : MAX_DAY_MINUTES,
                },
                endAdornment: <InputAdornment position="end">min</InputAdornment>,
              }}
              helperText="Use quick add chips for adjustments."
            />

            <Stack direction="row" spacing={1}>
              {QUICK_INCREMENTS.map((inc) => (
                <Chip
                  key={inc}
                  label={`+${inc}`}
                  onClick={() => handleQuickAdd(inc)}
                  variant="outlined"
                  color="primary"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>

            <Divider />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                label="Work mode"
                value={editorState.mode}
                onChange={(event) =>
                  setEditorState((prev) => ({
                    ...prev,
                    mode: event.target.value as WorkMode,
                  }))
                }
                select
                fullWidth
              >
                <MenuItem value="Office">Office</MenuItem>
                <MenuItem value="Homeworking">Homeworking</MenuItem>
              </TextField>

              <Autocomplete
                options={COUNTRIES}
                getOptionLabel={(option) => `${option.code} — ${option.name}`}
                value={
                  COUNTRIES.find((country) => country.code === editorState.country) ?? COUNTRIES[0]
                }
                onChange={(_, option) =>
                  setEditorState((prev) => ({
                    ...prev,
                    country: option?.code ?? '',
                  }))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Country" required />
                )}
              />
            </Stack>

            <TextField
              label="Note"
              multiline
              minRows={2}
              value={editorState.note}
              onChange={(event) =>
                setEditorState((prev) => ({
                  ...prev,
                  note: event.target.value,
                }))
              }
              placeholder="Why was this time spent?"
            />

            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Intervals</Typography>
                <Button size="small" onClick={handleAddInterval} startIcon={<Add fontSize="small" />}>
                  Add interval
                </Button>
              </Box>
              {editorState.intervals.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  Optional start–end ranges can be captured here.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {editorState.intervals.map((interval, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="Remove interval"
                          onClick={() => handleRemoveInterval(index)}
                          size="small"
                        >
                          <Clear fontSize="inherit" />
                        </IconButton>
                      }
                      sx={{ py: 0 }}
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1}>
                            <TextField
                              label="Start"
                              value={interval.start}
                              onChange={(event) =>
                                handleIntervalChange(index, 'start', event.target.value)
                              }
                              inputProps={{ placeholder: '09:00' }}
                              size="small"
                            />
                            <TextField
                              label="End"
                              value={interval.end}
                              onChange={(event) =>
                                handleIntervalChange(index, 'end', event.target.value)
                              }
                              inputProps={{ placeholder: '10:15' }}
                              size="small"
                            />
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Stack>

            {error && (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            )}

            <Stack direction="row" spacing={1} justifyContent="space-between">
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  startIcon={<ContentCopy fontSize="inherit" />}
                  onClick={handleDuplicateNext}
                >
                  Copy next day
                </Button>
                <Button
                  size="small"
                  startIcon={<CalendarViewWeek fontSize="inherit" />}
                  onClick={handleDuplicateWeek}
                >
                  Copy to week
                </Button>
                <Button
                  size="small"
                  startIcon={<Clear fontSize="inherit" />}
                  onClick={handleClearCell}
                  color="inherit"
                >
                  Clear
                </Button>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button onClick={handleCloseEditor} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveCell}
                  disabled={isSubmitting || !canSave}
                  startIcon={<Save fontSize="inherit" />}
                >
                  Save
                </Button>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Dialog>
    </Stack>
  );
};

export default WeekGridView;
