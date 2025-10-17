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
  TextField,
  Tooltip,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';

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
  onCommit: (payload: { minutes: number; note?: string | null }) => void;
}

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
  const [draftMinutes, setDraftMinutes] = useState(() => formatMinutes(minutes));
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
    setDraftNote(note ?? '');
    setError(null);
    setModalOpen(true);
  }, [minutes, note]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleSave = useCallback(() => {
    const parsed = parseMinutesInput(draftMinutes, minutes);
    if (parsed == null) {
      setError('Enter a valid time (e.g. 1:30 or 90)');
      return;
    }
    setError(null);
    if (parsed !== minutes || draftNote !== (note ?? '')) {
      onCommit({ minutes: parsed, note: draftNote });
    }
    setModalOpen(false);
  }, [draftMinutes, draftNote, minutes, note, onCommit]);

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
            <TextField
              label="Time (e.g., 1:30 or 90m)"
              value={draftMinutes}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setDraftMinutes(event.target.value)
              }
              error={Boolean(error)}
              helperText={error}
              autoFocus
            />
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
