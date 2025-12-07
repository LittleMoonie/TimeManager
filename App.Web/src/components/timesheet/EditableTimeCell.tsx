import { Comment } from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ChangeEvent, SyntheticEvent, useCallback, useMemo, useRef, useState } from 'react';

import {
  formatDecimalHours,
  formatMinutes,
  formatTimeOfDay,
  parseMinutesInput,
  parseTimeOfDay,
} from '@/utils/timeFormatting';

interface EditableTimeCellProps {
  gridId: string;
  rowKey: string;
  rowLabel: string;
  rowIndex: number;
  rowCount: number;
  dayIndex: number;
  dayCount: number;
  dayIso: string;
  dayLabel: string;
  minutes: number;
  note?: string | null;
  onCommit: (payload: { minutes: number; note?: string | null }) => void;
}

type TimeInputMode = 'duration' | 'decimal' | 'interval';
const STORAGE_KEY = 'timesheet.timeEntryMode';
const DEFAULT_INTERVAL = { start: '09:00', end: '17:00' };

export const EditableTimeCell = ({
  rowLabel,
  dayIso,
  dayLabel,
  minutes,
  note,
  onCommit,
}: EditableTimeCellProps) => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<TimeInputMode>(() => {
    if (typeof window === 'undefined') return 'duration';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'duration' || stored === 'decimal' || stored === 'interval'
      ? (stored as TimeInputMode)
      : 'decimal';
  });
  const [draftMinutes, setDraftMinutes] = useState(() => formatMinutes(minutes));
  const [draftDecimal, setDraftDecimal] = useState(() => formatDecimalHours(minutes));
  const intervalDefaultsRef = useRef<{ start: string; end: string }>(DEFAULT_INTERVAL);
  const [draftIntervalStart, setDraftIntervalStart] = useState(DEFAULT_INTERVAL.start);
  const [draftIntervalEnd, setDraftIntervalEnd] = useState(DEFAULT_INTERVAL.end);
  const [draftNote, setDraftNote] = useState(note ?? '');
  const [error, setError] = useState<string | null>(null);

  const borderRadius = Number(theme.shape.borderRadius) * 3;

  const normalizedRowLabel = useMemo(
    () => (rowLabel && rowLabel.trim().length ? rowLabel : 'Timesheet row'),
    [rowLabel],
  );

  const ariaLabel = `${normalizedRowLabel} — ${dayLabel} ${dayIso}`;

  const displayValue = formatMinutes(minutes);
  const showPlaceholder = !displayValue;

  const handleOpenModal = useCallback(() => {
    setDraftMinutes(formatMinutes(minutes));
    setDraftDecimal(formatDecimalHours(minutes));
    if (minutes > 0) {
      const baseStart = parseTimeOfDay(intervalDefaultsRef.current.start) ?? 9 * 60;
      setDraftIntervalStart(formatTimeOfDay(baseStart));
      setDraftIntervalEnd(formatTimeOfDay(baseStart + minutes));
    } else {
      setDraftIntervalStart(intervalDefaultsRef.current.start);
      setDraftIntervalEnd(intervalDefaultsRef.current.end);
    }
    setDraftNote(note ?? '');
    setError(null);
    setModalOpen(true);
  }, [minutes, note]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const computeDraftMinutes = useCallback((): number | null => {
    if (mode === 'duration') {
      return parseMinutesInput(draftMinutes, minutes);
    }
    if (mode === 'decimal') {
      const trimmed = draftDecimal.trim();
      if (!trimmed) return 0;
      const value = Number.parseFloat(trimmed);
      if (Number.isNaN(value)) return null;
      return Math.max(0, Math.round(value * 60));
    }
    const startValue = parseTimeOfDay(draftIntervalStart);
    const endValue = parseTimeOfDay(draftIntervalEnd);
    if (startValue == null || endValue == null) return null;
    const diff = (endValue - startValue + 24 * 60) % (24 * 60);
    if (diff === 0) return null;
    return diff;
  }, [mode, draftMinutes, minutes, draftDecimal, draftIntervalStart, draftIntervalEnd]);

  const handleModeChange = useCallback(
    (_event: SyntheticEvent, nextMode: TimeInputMode | null) => {
      if (!nextMode) return;
      const currentDraftMinutes = computeDraftMinutes();

      if (nextMode === 'duration') {
        const sourceMinutes = currentDraftMinutes ?? minutes;
        setDraftMinutes(formatMinutes(sourceMinutes));
      } else if (nextMode === 'decimal') {
        const sourceMinutes = currentDraftMinutes ?? minutes;
        setDraftDecimal(formatDecimalHours(sourceMinutes));
      } else {
        const sourceMinutes = currentDraftMinutes ?? minutes;
        const preferredStart = parseTimeOfDay(intervalDefaultsRef.current.start) ?? 9 * 60;
        const storedEnd = parseTimeOfDay(intervalDefaultsRef.current.end);
        const storedDuration =
          storedEnd != null ? (storedEnd - preferredStart + 24 * 60) % (24 * 60) : 8 * 60;
        const targetDuration =
          sourceMinutes && sourceMinutes > 0
            ? sourceMinutes
            : storedDuration > 0
              ? storedDuration
              : 8 * 60;
        setDraftIntervalStart(formatTimeOfDay(preferredStart));
        setDraftIntervalEnd(formatTimeOfDay(preferredStart + targetDuration));
      }

      setMode(nextMode);
      setError(null);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, nextMode);
      }
    },
    [computeDraftMinutes, minutes],
  );

  const handleIntervalStartChange = useCallback((value: string) => {
    setDraftIntervalStart(value);
    intervalDefaultsRef.current = { ...intervalDefaultsRef.current, start: value };
  }, []);

  const handleIntervalEndChange = useCallback((value: string) => {
    setDraftIntervalEnd(value);
    intervalDefaultsRef.current = { ...intervalDefaultsRef.current, end: value };
  }, []);

  const handleSave = useCallback(() => {
    let resolvedMinutes: number | null = null;

    if (mode === 'duration') {
      resolvedMinutes = parseMinutesInput(draftMinutes, minutes);
      if (resolvedMinutes == null) {
        setError('Enter a valid duration (e.g. 1:30, 90m, or 8h)');
        return;
      }
    } else if (mode === 'decimal') {
      const trimmed = draftDecimal.trim();
      if (!trimmed) {
        resolvedMinutes = 0;
      } else {
        const value = Number.parseFloat(trimmed);
        if (Number.isNaN(value) || value < 0) {
          setError('Enter decimal hours (e.g. 7.5)');
          return;
        }
        resolvedMinutes = Math.round(value * 60);
      }
    } else {
      const startValue = parseTimeOfDay(draftIntervalStart);
      const endValue = parseTimeOfDay(draftIntervalEnd);
      if (startValue == null || endValue == null) {
        setError('Provide times in HH:MM (24-hour) format.');
        return;
      }
      const diff = (endValue - startValue + 24 * 60) % (24 * 60);
      if (diff === 0) {
        setError('End time must be after start time.');
        return;
      }
      resolvedMinutes = diff;
      intervalDefaultsRef.current = {
        start: formatTimeOfDay(startValue),
        end: formatTimeOfDay(startValue + diff),
      };
    }

    const normalizedNote = draftNote.trim();
    setError(null);
    if (resolvedMinutes !== minutes || normalizedNote !== (note ?? '')) {
      onCommit({
        minutes: resolvedMinutes ?? 0,
        note: normalizedNote.length > 0 ? normalizedNote : null,
      });
    }
    setModalOpen(false);
  }, [
    draftMinutes,
    draftDecimal,
    draftIntervalStart,
    draftIntervalEnd,
    draftNote,
    minutes,
    mode,
    note,
    onCommit,
  ]);

  return (
    <>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <ButtonBase
          sx={{
            width: 72,
            height: 56,
            borderRadius: borderRadius,
            border: '1px solid transparent',
            transition: theme.transitions.create(['border-color', 'box-shadow'], {
              duration: theme.transitions.duration.shortest,
            }),
            fontVariantNumeric: 'tabular-nums',
            color: showPlaceholder ? theme.palette.text.disabled : theme.palette.text.primary,
            backgroundColor: 'transparent',
            display: 'flex',
            '&:focus-visible, &:focus': {
              outline: 'none',
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.24)}`,
            },
            '&:hover': {
              borderColor: theme.palette.action.hover,
              backgroundColor: alpha(theme.palette.primary.main, 0.06),
            },
          }}
          onClick={handleOpenModal}
          aria-label={ariaLabel}
          disableRipple
          disableTouchRipple
        >
          <Box
            component="span"
            sx={{
              minWidth: 0,
              px: 2,
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {showPlaceholder ? '0:00' : displayValue}
          </Box>
        </ButtonBase>
        {note && (
          <Tooltip title={note}>
            <IconButton size="small" onClick={handleOpenModal}>
              <Comment fontSize="small" sx={{ color: 'primary.main' }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="xs">
        <DialogTitle>{ariaLabel}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Tabs
              value={mode}
              onChange={handleModeChange}
              variant="fullWidth"
              aria-label="Time entry mode"
            >
              <Tab label="Duration" value="duration" />
              <Tab label="Decimal hours" value="decimal" />
              <Tab label="Start & end" value="interval" />
            </Tabs>
            {mode === 'duration' && (
              <TextField
                label="Time (e.g., 1:30, 90m, 8h)"
                value={draftMinutes}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDraftMinutes(event.target.value)
                }
                error={Boolean(error)}
                helperText={error ?? 'Use HH:MM, minutes, or add h (e.g. 7h30)'}
                autoFocus
              />
            )}
            {mode === 'decimal' && (
              <TextField
                label="Hours (e.g., 7.5)"
                value={draftDecimal}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDraftDecimal(event.target.value)
                }
                error={Boolean(error)}
                helperText={error ?? 'Enter hours using decimals. 1.5 = 1h 30m.'}
                autoFocus
              />
            )}
            {mode === 'interval' && (
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Start time"
                    value={draftIntervalStart}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      handleIntervalStartChange(event.target.value)
                    }
                    inputProps={{ placeholder: '08:00' }}
                    fullWidth
                    autoFocus
                  />
                  <TextField
                    label="End time"
                    value={draftIntervalEnd}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      handleIntervalEndChange(event.target.value)
                    }
                    inputProps={{ placeholder: '17:00' }}
                    fullWidth
                  />
                </Stack>
                <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
                  {error ?? '24-hour clock. Crossing midnight is supported.'}
                </Typography>
              </Stack>
            )}
            <TextField
              label="Note"
              multiline
              minRows={3}
              maxRows={8}
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              inputProps={{ maxLength: 300 }}
              helperText={`${draftNote.length}/300`}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 'auto',
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
