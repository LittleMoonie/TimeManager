import { Add, ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays, format, formatISO, isAfter, startOfWeek } from 'date-fns';
import { useMemo, useState } from 'react';

import TimesheetRowEditor from '@/components/timesheet/TimesheetRowEditor';
import { AppBreadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useWeeklyTimesheet } from '@/hooks/useTimesheet';
import { useCountriesLookup, useTimeCodesLookup } from '@/hooks/useTimesheetLookups';
import { useUsersLookup } from '@/hooks/useUsersLookup';
import {
  ActionCode,
  TimesheetRowLocation,
  TimesheetRowStatus,
  TimesheetStatus,
  UserResponseDto,
} from '@/lib/api';
import type { WeekDate } from '@/types/timesheet';
import { formatMinutes } from '@/utils/timeFormatting';
import { buildTimesheetRow } from '@/utils/timesheetRow';

const MyTimesheetPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(() => startOfWeek(today, { weekStartsOn: 1 }));
  const [selectedTimeCode, setSelectedTimeCode] = useState<ActionCode | null>(null);
  const [timeCodeQuery, setTimeCodeQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
  const [userQuery, setUserQuery] = useState('');

  const canCreateForUser = user?.permissions?.includes('timesheet.create.forUser') ?? false;

  const weekStartIso = formatISO(selectedDate, { representation: 'date' });
  const weekDates: WeekDate[] = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, idx) => {
        const date = addDays(selectedDate, idx);
        return {
          iso: formatISO(date, { representation: 'date' }),
          label: format(date, 'EEE dd'),
        };
      }),
    [selectedDate],
  );

  const {
    rows,
    settings,
    isLoading,
    isSaving,
    dirty,
    lastSavedAt,
    timesheetStatus,
    rejection,
    updateRow,
    updateEntry,
    replaceRows,
    submitWeek,
    forceSave,
  } = useWeeklyTimesheet({ weekStart: weekStartIso });

  const { data: users, isLoading: usersLoading } = useUsersLookup(userQuery);
  const { data: timeCodes = [], isLoading: timeCodesLoading } = useTimeCodesLookup(timeCodeQuery);
  const { data: countries = [] } = useCountriesLookup();

  const defaultCountry = settings?.defaultCountryCode || 'US';
  const defaultLocation =
    (settings?.defaultLocation as TimesheetRowLocation | undefined) ?? TimesheetRowLocation.OFFICE;

  const usedTimeCodeIds = useMemo(() => new Set(rows.map((row) => row.timeCodeId)), [rows]);
  const availableTimeCodes = useMemo(
    () =>
      (timeCodes as ActionCode[]).filter(
        (code: ActionCode) => code.active && !usedTimeCodeIds.has(code.id),
      ),
    [timeCodes, usedTimeCodeIds],
  );

  const canAddSelectedCode = Boolean(selectedTimeCode && !usedTimeCodeIds.has(selectedTimeCode.id));

  const handleShiftWeek = (direction: -1 | 1) => {
    const next = addDays(selectedDate, direction * 7);
    if (direction > 0 && isAfter(next, today)) {
      return;
    }
    setSelectedDate(startOfWeek(next, { weekStartsOn: 1 }));
  };

  const handleAddRow = (timeCode: ActionCode | null) => {
    if (!timeCode || usedTimeCodeIds.has(timeCode.id)) {
      setSelectedTimeCode(null);
      setTimeCodeQuery('');
      return;
    }
    const newRow = buildTimesheetRow(timeCode, defaultCountry, defaultLocation);
    replaceRows([...rows, newRow]);
    setSelectedTimeCode(null);
    setTimeCodeQuery('');
  };

  const handleRemoveRow = (rowId: string) => {
    replaceRows(rows.filter((candidate) => (candidate.id ?? candidate.clientId) !== rowId));
  };

  const totalMinutes = rows.reduce((total, row) => {
    const rowTotal = Object.values(row.entries).reduce((sum, entry) => sum + entry.minutes, 0);
    return total + rowTotal;
  }, 0);

  const statusSummary = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  const autoSubmitted = rows.some(
    (row) => row.status === TimesheetRowStatus.SUBMITTED && row.locked,
  );

  const statusIndicator = (() => {
    if (isSaving) {
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={14} />
          <Typography variant="caption">Saving…</Typography>
        </Stack>
      );
    }
    if (dirty) {
      return (
        <Typography variant="caption" color="warning.main">
          Unsaved changes
        </Typography>
      );
    }
    return (
      <Typography variant="caption" color="success.main">
        Autosave on • {lastSavedAt ? `Saved ${format(lastSavedAt, 'HH:mm')}` : 'All changes saved'}
      </Typography>
    );
  })();

  const statusChipColor: 'default' | 'success' | 'warning' | 'error' = (() => {
    switch (timesheetStatus) {
      case TimesheetStatus.APPROVED:
        return 'success';
      case TimesheetStatus.SUBMITTED:
        return 'warning';
      case TimesheetStatus.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  })();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default, pb: 6 }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Stack spacing={3}>
          <AppBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'My Timesheet' }]} />

          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
            }}
          >
            <Box sx={{ p: { xs: 3, md: 4 } }}>
              <PageHeader
                title="My Timesheet"
                subtitle={`Week of ${format(selectedDate, 'MMM dd, yyyy')}`}
                actions={
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          variant="outlined"
                          startIcon={<ChevronLeft />}
                          onClick={() => handleShiftWeek(-1)}
                        >
                          Previous
                        </Button>
                        <DatePicker
                          value={selectedDate}
                          onChange={(newDate) =>
                            newDate && setSelectedDate(startOfWeek(newDate, { weekStartsOn: 1 }))
                          }
                          maxDate={today}
                          sx={{ width: '180px' }}
                        />
                        <Button
                          variant="outlined"
                          endIcon={<ChevronRight />}
                          onClick={() => handleShiftWeek(1)}
                          disabled={isAfter(addDays(selectedDate, 7), today)}
                        >
                          Next
                        </Button>
                      </Stack>
                    </LocalizationProvider>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button variant="outlined" onClick={forceSave} disabled={!dirty && !isSaving}>
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        onClick={submitWeek}
                        disabled={isSaving || rows.length === 0}
                      >
                        Submit
                      </Button>
                    </Stack>
                  </Stack>
                }
              />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                sx={{ mt: 3 }}
              >
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip
                    label={`${selectedUser ? selectedUser.firstName + ' ' + selectedUser.lastName : user?.firstName + ' ' + user?.lastName}`}
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    }}
                  />
                  {timesheetStatus && (
                    <Chip
                      label={timesheetStatus.toLowerCase()}
                      color={statusChipColor}
                      sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                    />
                  )}
                  {statusIndicator}
                </Stack>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Keep your week current – updates autosave every few seconds.
                </Typography>
              </Stack>

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', md: 'center' }}
                justifyContent="flex-end"
                sx={{ mt: 3 }}
              >
                {canCreateForUser && (
                  <Autocomplete
                    sx={{ width: { xs: '100%', md: 280 } }}
                    size="small"
                    options={users?.data ?? []}
                    loading={usersLoading}
                    value={selectedUser}
                    onChange={(_, value) => setSelectedUser(value)}
                    inputValue={userQuery}
                    onInputChange={(_, value) => setUserQuery(value)}
                    getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select User"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {usersLoading ? <CircularProgress size={16} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                )}
                <Autocomplete
                  sx={{ width: { xs: '100%', md: 280 } }}
                  size="small"
                  options={availableTimeCodes}
                  loading={timeCodesLoading}
                  value={selectedTimeCode}
                  onChange={(_, value) => setSelectedTimeCode(value)}
                  inputValue={timeCodeQuery}
                  onInputChange={(_, value) => setTimeCodeQuery(value)}
                  getOptionLabel={(option) => `${option.code} — ${option.name}`}
                  groupBy={(option) => option.category?.name ?? 'Uncategorized'}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Quick-add time code"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {timeCodesLoading ? <CircularProgress size={16} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleAddRow(selectedTimeCode)}
                  disabled={!canAddSelectedCode}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Add row
                </Button>
              </Stack>
            </Box>

            {autoSubmitted && (
              <Alert severity="info" sx={{ mx: { xs: 3, md: 4 }, mb: 2 }}>
                Week auto-submitted. Contact your manager to reopen it if adjustments are needed.
              </Alert>
            )}

            {timesheetStatus === TimesheetStatus.REJECTED && rejection && (
              <Alert severity="error" sx={{ mx: { xs: 3, md: 4 }, mb: 2 }}>
                {rejection.reason ? `Rejected: ${rejection.reason}` : 'Timesheet was rejected.'}
                {rejection.actorName && ` • ${rejection.actorName}`}
                {rejection.occurredAt &&
                  ` • ${format(new Date(rejection.occurredAt), 'MMM dd, yyyy HH:mm')}`}
              </Alert>
            )}

            {isLoading ? (
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" py={5}>
                <CircularProgress size={28} />
                <Typography variant="body1">Loading your week…</Typography>
              </Stack>
            ) : (
              <Box sx={{ px: { xs: 3, md: 4 }, pb: 3 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: 2 }}
                >
                  <Chip
                    label={`Total ${formatMinutes(totalMinutes) || '0:00'}`}
                    color={
                      totalMinutes > (settings?.maxWeeklyMinutes ?? 2400) ? 'warning' : 'default'
                    }
                  />
                  <Chip label={`${rows.length} rows`} variant="outlined" />
                  {Object.values(TimesheetRowStatus).map((status) => (
                    <Chip
                      key={status}
                      label={`${statusSummary[status] ?? 0} ${status.toLowerCase()}`}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  ))}
                </Stack>

                <TableContainer
                  sx={{
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Activity</TableCell>
                        <TableCell>Time code</TableCell>
                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                          Location
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                          Country
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                          Employee location
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          Billable
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          Status
                        </TableCell>
                        {weekDates.map((day) => (
                          <TableCell key={day.iso} align="center">
                            {day.label}
                          </TableCell>
                        ))}
                        <TableCell align="center">Total</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={weekDates.length + 10}>
                            <Box sx={{ py: 6 }}>
                              <Typography
                                variant="body1"
                                color="text.secondary"
                                align="center"
                                gutterBottom
                              >
                                No time entries yet.
                              </Typography>
                              <Typography variant="body2" color="text.secondary" align="center">
                                Add a time code above to start tracking your week.
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((row, index) => (
                          <TimesheetRowEditor
                            key={row.clientId}
                            row={row}
                            rowIndex={index}
                            rowCount={rows.length}
                            gridId="timesheet"
                            weekDates={weekDates}
                            timeCodes={timeCodes as ActionCode[]}
                            countries={countries}
                            onUpdateRow={updateRow}
                            onUpdateEntry={updateEntry}
                            onClear={() => updateRow(row.id ?? row.clientId, { entries: {} })}
                            onRemove={() => handleRemoveRow(row.id ?? row.clientId)}
                            timesheetStatus={timesheetStatus}
                            rowRejection={row.rejection}
                            timesheetRejection={rejection}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default MyTimesheetPage;
