import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccessTime,
  NightShelter,
  PlayCircleFilled,
  StopCircle,
  PauseCircle,
  RestartAlt,
  FmdGood,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { useAuth, useDataStore, useOrgStore } from '@/store';
import type { ClockEvent, ClockType } from '@/types';

import { useI18n } from '@/i18n';

dayjs.extend(utc);
dayjs.extend(timezone);

type SessionStatus = 'IDLE' | 'WORKING' | 'ON_BREAK';

interface SessionSnapshot {
  status: SessionStatus;
  minutesWorked: number;
  breakMinutes: number;
  sessionStart?: dayjs.Dayjs | null;
  breakStart?: dayjs.Dayjs | null;
  lastEvent?: ClockEvent;
}

const formatDuration = (minutes: number) => {
  const safeMinutes = Math.max(minutes, 0);
  const hrs = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const buildSnapshot = (events: ClockEvent[], tz: string): SessionSnapshot => {
  const sorted = [...events].sort((a, b) => dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf());
  let status: SessionStatus = 'IDLE';
  let sessionStart: dayjs.Dayjs | null = null;
  let breakStart: dayjs.Dayjs | null = null;
  let workedMinutes = 0;
  let breakMinutes = 0;
  let lastEvent: ClockEvent | undefined;

  sorted.forEach((event) => {
    const ts = dayjs(event.timestamp).tz(tz);
    lastEvent = event;
    switch (event.type) {
      case 'IN': {
        status = 'WORKING';
        sessionStart = ts;
        breakStart = null;
        break;
      }
      case 'BREAK_START': {
        if (sessionStart) {
          workedMinutes += Math.max(ts.diff(sessionStart, 'minute'), 0);
          sessionStart = null;
        }
        breakStart = ts;
        status = 'ON_BREAK';
        break;
      }
      case 'BREAK_END': {
        if (breakStart) {
          breakMinutes += Math.max(ts.diff(breakStart, 'minute'), 0);
        }
        breakStart = null;
        sessionStart = ts;
        status = 'WORKING';
        break;
      }
      case 'OUT': {
        if (sessionStart) {
          workedMinutes += Math.max(ts.diff(sessionStart, 'minute'), 0);
        }
        sessionStart = null;
        breakStart = null;
        status = 'IDLE';
        break;
      }
      default:
        break;
    }
  });

  return {
    status,
    minutesWorked: workedMinutes,
    breakMinutes,
    sessionStart,
    breakStart,
    lastEvent,
  };
};

const BadgePanel = () => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const { organization } = useOrgStore((state) => ({ organization: state.organization }));
  const tz = organization?.settings.timezone ?? 'UTC';
  const {
    clockEvents,
    badge,
  } = useDataStore((state) => ({
    clockEvents: state.clockEvents,
    badge: state.badge,
  }));
  const [note, setNote] = useState('');
  const [confirmType, setConfirmType] = useState<ClockType | null>(null);
  const [pendingNote, setPendingNote] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [refreshCounter, setRefreshCounter] = useState(0);

  const userEvents = useMemo(
    () =>
      clockEvents.filter((event) => {
        const ts = dayjs(event.timestamp).tz(tz);
        return event.userId === currentUser.id && ts.isSame(dayjs().tz(tz), 'day');
      }),
    [clockEvents, currentUser.id, tz, refreshCounter],
  );

  const snapshot = useMemo(() => buildSnapshot(userEvents, tz), [userEvents, tz]);

  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs().tz(tz);
      if (snapshot.status === 'WORKING' && snapshot.sessionStart) {
        const minutes = snapshot.minutesWorked + Math.max(now.diff(snapshot.sessionStart, 'minute'), 0);
        setElapsed(formatDuration(minutes));
      } else if (snapshot.status === 'ON_BREAK' && snapshot.breakStart) {
        const minutes = Math.max(now.diff(snapshot.breakStart, 'minute'), 0);
        setElapsed(formatDuration(minutes));
      } else {
        setElapsed('00:00');
      }
    }, 1000 * 30);
    return () => clearInterval(interval);
  }, [snapshot.status, snapshot.sessionStart, snapshot.breakStart, snapshot.minutesWorked, tz]);

  useEffect(() => {
    // initial tick to avoid waiting 30s
    const now = dayjs().tz(tz);
    if (snapshot.status === 'WORKING' && snapshot.sessionStart) {
      const minutes = snapshot.minutesWorked + Math.max(now.diff(snapshot.sessionStart, 'minute'), 0);
      setElapsed(formatDuration(minutes));
    } else if (snapshot.status === 'ON_BREAK' && snapshot.breakStart) {
      const minutes = Math.max(now.diff(snapshot.breakStart, 'minute'), 0);
      setElapsed(formatDuration(minutes));
    } else {
      setElapsed('00:00');
    }
  }, [snapshot.status, snapshot.sessionStart, snapshot.breakStart, snapshot.minutesWorked, tz]);

  const eventLabels = useMemo(
    () => ({
      IN: t('badge.events.IN'),
      OUT: t('badge.events.OUT'),
      BREAK_START: t('badge.events.BREAK_START'),
      BREAK_END: t('badge.events.BREAK_END'),
    }),
    [t],
  );

  const handleBadge = async (type: ClockType, overrideNote = note, force = false) => {
    try {
      await badge(currentUser.id, type, overrideNote || undefined, { force });
      setNote('');
      setSnackbar({ open: true, message: t('badge.success', { action: eventLabels[type] }), severity: 'success' });
      setRefreshCounter((value) => value + 1);
    } catch (error) {
      if ((error as Error).name === 'BadgeConfirmError') {
        setConfirmType(type);
        setPendingNote(overrideNote);
        return;
      }
      const message = error instanceof Error ? error.message : t('badge.error');
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const confirmBadge = async () => {
    if (!confirmType) return;
    await handleBadge(confirmType, pendingNote, true);
    setConfirmType(null);
  };

  const dismissConfirm = () => {
    setConfirmType(null);
  };

  const timeline = useMemo(() => {
    return [...userEvents]
      .sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf())
      .map((event) => {
        const time = dayjs(event.timestamp).tz(tz).format('HH:mm');
        return {
          id: event.id,
          primary: `${eventLabels[event.type]} • ${time}`,
          secondary: event.note,
          icon:
            event.type === 'IN'
              ? <PlayCircleFilled color="success" />
              : event.type === 'OUT'
                ? <StopCircle color="error" />
                : event.type === 'BREAK_START'
                  ? <PauseCircle color="warning" />
                  : <RestartAlt color="primary" />,
        };
      });
  }, [userEvents, tz, eventLabels]);

  const lastEventLabel = snapshot.lastEvent
    ? `${eventLabels[snapshot.lastEvent.type]} · ${dayjs(snapshot.lastEvent.timestamp).tz(tz).format('HH:mm')}`
    : t('badge.noActivity');

  const lastEventGeo = snapshot.lastEvent?.geo;

  const disableButtons = {
    in: snapshot.status === 'WORKING' || snapshot.status === 'ON_BREAK',
    breakStart: snapshot.status !== 'WORKING',
    breakEnd: snapshot.status !== 'ON_BREAK',
    out: snapshot.status !== 'WORKING',
  };

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={5}>
        <Card>
          <CardHeader title={t('badge.title')} subheader={dayjs().tz(tz).format('dddd, MMMM D')} />
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip color={snapshot.status === 'WORKING' ? 'success' : snapshot.status === 'ON_BREAK' ? 'warning' : 'default'} label={snapshot.status === 'WORKING' ? t('badge.status.working', { duration: elapsed }) : snapshot.status === 'ON_BREAK' ? t('badge.status.onBreak', { duration: elapsed }) : t('badge.status.idle')} />
                <Typography variant="body2" color="text.secondary">
                  {lastEventLabel}
                </Typography>
              </Stack>
              {lastEventGeo && (
                <Alert severity="info" icon={<FmdGood fontSize="small" />}>
                  <Typography variant="body2">{t('badge.location.insideZone')}</Typography>
                </Alert>
              )}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayCircleFilled />}
                  disabled={disableButtons.in}
                  onClick={() => handleBadge('IN')}
                >
                  {t('actions.clockIn')}
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<PauseCircle />}
                  disabled={disableButtons.breakStart}
                  onClick={() => handleBadge('BREAK_START')}
                >
                  {t('actions.startBreak')}
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<RestartAlt />}
                  disabled={disableButtons.breakEnd}
                  onClick={() => handleBadge('BREAK_END')}
                >
                  {t('actions.endBreak')}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<StopCircle />}
                  disabled={disableButtons.out}
                  onClick={() => handleBadge('OUT')}
                >
                  {t('actions.clockOut')}
                </Button>
              </Stack>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('badge.noteTitle')}
                </Typography>
                <TextField
                  multiline
                  minRows={3}
                  placeholder={t('badge.notePlaceholder')}
                  fullWidth
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={12} md={7}>
        <Card>
          <CardHeader title={t('badge.timelineTitle')} />
          <CardContent>
            <List>
              {timeline.length === 0 && (
                <ListItem>
                  <ListItemIcon>
                    <AccessTime color="disabled" />
                  </ListItemIcon>
                  <ListItemText primary={t('badge.timelineEmpty')} />
                </ListItem>
              )}
              {timeline.map((entry) => (
                <ListItem key={entry.id} divider>
                  <ListItemIcon>{entry.icon}</ListItemIcon>
                  <ListItemText primary={entry.primary} secondary={entry.secondary} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={confirmType !== null} onClose={dismissConfirm} aria-labelledby="confirm-badge-dialog">
        <DialogTitle id="confirm-badge-dialog">{t('badge.confirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('badge.confirmMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={dismissConfirm}>{t('badge.cancel')}</Button>
          <Button onClick={confirmBadge} variant="contained" color="primary">
            {t('badge.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default BadgePanel;
