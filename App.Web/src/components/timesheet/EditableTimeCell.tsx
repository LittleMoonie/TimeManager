import { Comment } from '@mui/icons-material';
import { Box, Button, ButtonBase, IconButton, Modal, Popover, Stack, TextField } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  KeyboardEvent,
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { formatMinutes, parseMinutesInput } from '@/utils/timeFormatting';

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
  disabled: boolean;
  onCommit: (payload: { minutes: number; note?: string | null }) => void;
}

export const EditableTimeCell = ({
  gridId,
  rowKey,
  rowLabel,
  rowIndex,
  rowCount,
  dayIndex,
  dayCount,
  dayIso,
  dayLabel,
  minutes,
  note,
  disabled,
  onCommit,
}: EditableTimeCellProps) => {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [draftMinutes, setDraftMinutes] = useState(() => formatMinutes(minutes));
  const [error, setError] = useState<string | null>(null);
  const [noteAnchor, setNoteAnchor] = useState<HTMLElement | null>(null);
  const [draftNote, setDraftNote] = useState(note ?? '');
  const [modalOpen, setModalOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const minutesInputRef = useRef<HTMLInputElement | null>(null);
  const wasEditingRef = useRef(false);

  const borderRadius = Number(theme.shape.borderRadius) * 3;

  const normalizedRowLabel = useMemo(
    () => (rowLabel && rowLabel.trim().length ? rowLabel : 'Timesheet row'),
    [rowLabel],
  );

  const ariaLabel = `${normalizedRowLabel} — ${dayLabel} ${dayIso}`;
  const cellId = `${gridId}-${rowKey}-${dayIso}`;

  useEffect(() => {
    if (!editing) {
      requestAnimationFrame(() => {
        setDraftMinutes(formatMinutes(minutes));
      });
    }
  }, [editing, minutes]);
  useEffect(() => {
    if (wasEditingRef.current && !editing && !disabled) {
      requestAnimationFrame(() => {
        buttonRef.current?.focus();
      });
    }
    wasEditingRef.current = editing;
  }, [editing, disabled]);

  const displayValue = formatMinutes(minutes);
  const showPlaceholder = !displayValue;

  const focusCell = useCallback(
    (targetRow: number, targetCol: number) => {
      if (typeof document === 'undefined') return false;
      const selector = `[data-grid-id="${gridId}"][data-row-index="${targetRow}"][data-col-index="${targetCol}"]`;
      const candidate = document.querySelector<HTMLButtonElement>(selector);
      if (candidate) {
        candidate.focus();
        return true;
      }
      return false;
    },
    [gridId],
  );

  const startEditing = useCallback(() => {
    if (disabled) return;
    setDraftMinutes(formatMinutes(minutes));
    setError(null);
    setEditing(true);
  }, [disabled, minutes]);

  const cancelEditing = useCallback(() => {
    setDraftMinutes(formatMinutes(minutes));
    setError(null);
    setEditing(false);
  }, [minutes]);

  const commitEditing = useCallback(() => {
    const parsed = parseMinutesInput(draftMinutes, minutes);
    if (parsed == null) {
      setError('Enter a valid time (e.g. 1:30 or 90)');
      requestAnimationFrame(() => {
        minutesInputRef.current?.focus();
      });
      return;
    }
    setError(null);
    if (parsed !== minutes) {
      onCommit({ minutes: parsed, note });
    }
    setEditing(false);
  }, [draftMinutes, minutes, onCommit, note]);

  const handleButtonKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (event.key === 'Enter') {
        event.preventDefault();
        startEditing();
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        return;
      }

      if (
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown'
      ) {
        event.preventDefault();
        if (event.key === 'ArrowLeft' && dayIndex > 0) {
          focusCell(rowIndex, dayIndex - 1);
        } else if (event.key === 'ArrowRight' && dayIndex < dayCount - 1) {
          focusCell(rowIndex, dayIndex + 1);
        } else if (event.key === 'ArrowUp' && rowIndex > 0) {
          focusCell(rowIndex - 1, dayIndex);
        } else if (event.key === 'ArrowDown' && rowIndex < rowCount - 1) {
          focusCell(rowIndex + 1, dayIndex);
        }
        return;
      }
    },
    [dayCount, dayIndex, disabled, focusCell, rowCount, rowIndex, startEditing],
  );

  const handleMinutesKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitEditing();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelEditing();
      }
    },
    [cancelEditing, commitEditing],
  );

  const handleMinutesBlur = useCallback(() => {
    commitEditing();
  }, [commitEditing]);

  const handleNoteIconClick = () => {
    setModalOpen(true);
  };

  const handleNoteClose = () => {
    setModalOpen(false);
    if (draftNote !== note) {
      onCommit({ minutes, note: draftNote });
    }
  };

  if (editing) {
    return (
      <Box sx={{ width: '100%', display: 'flex' }}>
        <TextField
          id={`${cellId}-input`}
          size="medium"
          fullWidth
          value={draftMinutes}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setDraftMinutes(event.target.value)}
          onBlur={handleMinutesBlur}
          onKeyDown={handleMinutesKeyDown}
          inputRef={minutesInputRef}
          placeholder="0:00"
          error={Boolean(error)}
          helperText={error ?? undefined}
          FormHelperTextProps={{
            sx: { textAlign: 'right', m: 0 },
          }}
          inputProps={{
            'aria-label': ariaLabel,
            inputMode: 'numeric',
            style: {
              textAlign: 'center',
              borderRadius: borderRadius,
            },
            autoComplete: 'off',
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: borderRadius,
              fontWeight: 600,
            },
          }}
        />
      </Box>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <ButtonBase
        ref={buttonRef}
        id={cellId}
        data-grid-id={gridId}
        data-row-index={rowIndex}
        data-col-index={dayIndex}
        data-day-iso={dayIso}
        data-disabled={disabled ? 'true' : 'false'}
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
        tabIndex={disabled ? -1 : 0}
        onClick={startEditing}
        onKeyDown={handleButtonKeyDown}
        aria-label={ariaLabel}
        aria-disabled={disabled ? 'true' : undefined}
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
      <IconButton size="small" onClick={handleNoteIconClick} disabled={disabled}>
        <Comment fontSize="small" sx={{ color: draftNote ? 'primary.main' : 'action.disabled' }} />
      </IconButton>
      <Modal
        open={modalOpen}
        onClose={handleNoteClose}
        aria-labelledby="note-modal-title"
        aria-describedby="note-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400, // Square size
            height: 400, // Square size
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TextField
            label="Note"
            multiline
            fullWidth
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            inputProps={{ maxLength: 300 }}
            helperText={`${draftNote.length}/300`}
            minRows={5} // Increased minRows for better visibility
            maxRows={10}
            sx={{
              flexGrow: 1,
              // Override default MUI styles that might be fixing the height
              '& .MuiInputBase-root': {
                height: 'auto',
                overflow: 'auto',
              },
              '& .MuiOutlinedInput-root': {
                height: 'auto',
                overflow: 'auto',
              },
            }} // Allow TextField to grow
          />
          <Button onClick={handleNoteClose} sx={{ mt: 2 }}>
            Save
          </Button>
        </Box>
      </Modal>
    </Stack>
  );
};
