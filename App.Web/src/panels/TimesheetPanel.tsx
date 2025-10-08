import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Download, Refresh } from '@mui/icons-material';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { useAuth, useDataStore, useOrgStore } from '@/store';
import type { TimesheetResponse, User } from '@/types';
import { usePortalContext } from '@/portalContext';
import { useI18n } from '@/i18n';
import { approveTimesheet } from '@/api/userApi';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

const formatHours = (value: number) => `${value.toFixed(2)}h`;

const TimesheetPanel = () => {
  const { t } = useI18n();
  const { currentUser, can } = useAuth();
  const { organization } = useOrgStore((state) => ({ organization: state.organization }));
  const { activeTeamId } = usePortalContext();
  const {
    fetchTimesheet,
    users,
    teams,
  } = useDataStore((state) => ({
    fetchTimesheet: state.fetchTimesheet,
    users: state.users,
    teams: state.teams,
  }));

  const tz = organization?.settings.timezone ?? dayjs.tz.guess();

  const accessibleUsers = useMemo(() => {
    if (currentUser.role === 'CEO') {
      return activeTeamId === 'all' ? users : users.filter((user) => user.teamId === activeTeamId);
    }
    if (currentUser.role === 'MANAGER') {
      const managedTeams = teams.filter((team) => team.managerId === currentUser.id).map((team) => team.id);
      return users.filter((user) => user.teamId && managedTeams.includes(user.teamId) || user.id === currentUser.id);
    }
    return users.filter((user) => user.id === currentUser.id);
  }, [users, teams, currentUser, activeTeamId]);

  const [selectedUserId, setSelectedUserId] = useState<string>(() => accessibleUsers[0]?.id ?? currentUser.id);
  useEffect(() => {
    if (!accessibleUsers.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(accessibleUsers[0]?.id ?? currentUser.id);
    }
  }, [accessibleUsers, selectedUserId, currentUser.id]);

  const [selectedDate, setSelectedDate] = useState(() => dayjs().tz(tz).startOf('isoWeek'));
  const [timesheet, setTimesheet] = useState<TimesheetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [dialog, setDialog] = useState<{ action: 'approve' | 'reject'; open: boolean }>({ action: 'approve', open: false });

  const loadTimesheet = useCallback(async () => {
    if (!selectedUserId) return;
    const start = selectedDate.startOf('isoWeek');
    const end = start.add(6, 'day').endOf('day');
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTimesheet(selectedUserId, start.toISOString(), end.toISOString());
      setTimesheet(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load timesheet';
      setError(message);
      setTimesheet(null);
    } finally {
      setLoading(false);
    }
  }, [fetchTimesheet, selectedDate, selectedUserId]);

  useEffect(() => {
    void loadTimesheet();
  }, [loadTimesheet]);

  const selectedUser = useMemo(() => accessibleUsers.find((user) => user.id === selectedUserId), [accessibleUsers, selectedUserId]);

  const canApprove = can('time.approve') && selectedUser && selectedUser.id !== currentUser.id;

  const totalWorked = timesheet?.days.reduce((sum, day) => sum + day.workedHours, 0) ?? 0;
  const totalPlanned = timesheet?.days.reduce((sum, day) => sum + day.plannedHours, 0) ?? 0;

  const handleApproveAction = async (approve: boolean) => {
    if (!timesheet || !selectedUser) return;
    setLoading(true);
    try {
      await approveTimesheet(selectedUser.id, timesheet.weekOf, approve, note || undefined, currentUser.id);
      await loadTimesheet();
      setNote('');
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    if (!timesheet || !selectedUser) return;
    const header = 'Date,Planned Hours,Worked Hours,Late,Absent\n';
    const rows = timesheet.days
      .map((day) => {
        const date = dayjs(day.date).tz(tz).format('YYYY-MM-DD');
        return [date, day.plannedHours, day.workedHours, day.late ? 'Yes' : 'No', day.absent ? 'Yes' : 'No'].join(',');
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timesheet_${selectedUser.firstName}_${selectedUser.lastName}_${timesheet.weekOf}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card>
            <CardHeader title={t('timesheet.filtersTitle')} />
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  select
                  label={t('timesheet.userLabel')}
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                  disabled={currentUser.role === 'USER'}
                >
                  {accessibleUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </TextField>
                <DatePicker
                  label={t('timesheet.weekPicker')}
                  value={selectedDate}
                  onChange={(value) => value && setSelectedDate(value.startOf('isoWeek'))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" startIcon={<Refresh />} onClick={loadTimesheet} disabled={loading}>
                    {t('actions.refresh')}
                  </Button>
                  <Button variant="outlined" startIcon={<Download />} onClick={exportCsv} disabled={!timesheet}>
                    {t('actions.export')}
                  </Button>
                </Stack>
                {canApprove && (
                  <Stack spacing={1}>
                    <TextField
                      label={t('timesheet.approvalNote')}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      multiline
                      minRows={3}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" color="success" onClick={() => setDialog({ action: 'approve', open: true })} disabled={loading}>
                        {t('actions.approve')}
                      </Button>
                      <Button variant="outlined" color="error" onClick={() => setDialog({ action: 'reject', open: true })} disabled={loading}>
                        {t('actions.reject')}
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={8}>
          <Card>
            <CardHeader
              title={t('timesheet.title')}
              subheader={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
              action={
                timesheet && (
                  <Chip
                    color={timesheet.approved ? 'success' : 'warning'}
                    label={timesheet.approved ? t('timesheet.approved') : t('timesheet.pending')}
                  />
                )
              }
            />
            <CardContent>
              {loading && (
                <Stack alignItems="center" justifyContent="center" py={6}>
                  <CircularProgress />
                </Stack>
              )}
              {!loading && error && <Alert severity="error">{error}</Alert>}
              {!loading && !error && timesheet && (
                <Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('timesheet.columns.day')}</TableCell>
                        <TableCell>{t('timesheet.columns.planned')}</TableCell>
                        <TableCell>{t('timesheet.columns.worked')}</TableCell>
                        <TableCell>{t('timesheet.columns.delta')}</TableCell>
                        <TableCell>{t('timesheet.columns.status')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {timesheet.days.map((day) => {
                        const date = dayjs(day.date).tz(tz);
                        const delta = day.workedHours - day.plannedHours;
                        return (
                          <TableRow
                            key={day.date}
                            sx={{
                              backgroundColor: day.absent
                                ? 'warning.light'
                                : day.late
                                  ? 'rgba(255,193,7,0.14)'
                                  : undefined,
                            }}
                          >
                            <TableCell>{date.format('ddd DD MMM')}</TableCell>
                            <TableCell>{formatHours(day.plannedHours)}</TableCell>
                            <TableCell>{formatHours(day.workedHours)}</TableCell>
                            <TableCell sx={{ color: delta >= 0 ? 'success.main' : 'error.main' }}>{formatHours(delta)}</TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                {day.late && <Chip size="small" color="warning" label={t('timesheet.badges.late')} />}
                                {day.absent && <Chip size="small" color="error" label={t('timesheet.badges.absent')} />}
                                {!day.late && !day.absent && day.workedHours > 0 && (
                                  <Chip size="small" color="success" label={t('timesheet.badges.onTime')} />
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow>
                        <TableCell>
                          <Typography fontWeight={600}>{t('timesheet.summary')}</Typography>
                        </TableCell>
                        <TableCell>{formatHours(totalPlanned)}</TableCell>
                        <TableCell>{formatHours(totalWorked)}</TableCell>
                        <TableCell sx={{ color: totalWorked - totalPlanned >= 0 ? 'success.main' : 'error.main' }}>
                          {formatHours(totalWorked - totalPlanned)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={dialog.open} onClose={() => setDialog((prev) => ({ ...prev, open: false }))}>
        <DialogTitle>
          {dialog.action === 'approve' ? t('timesheet.confirmApproveTitle') : t('timesheet.confirmRejectTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialog.action === 'approve' ? t('timesheet.confirmApproveBody') : t('timesheet.confirmRejectBody')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog((prev) => ({ ...prev, open: false }))}>{t('timesheet.cancel')}</Button>
          <Button
            onClick={async () => {
              await handleApproveAction(dialog.action === 'approve');
              setDialog((prev) => ({ ...prev, open: false }));
            }}
            variant="contained"
            color={dialog.action === 'approve' ? 'success' : 'error'}
          >
            {dialog.action === 'approve' ? t('actions.approve') : t('actions.reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TimesheetPanel;
