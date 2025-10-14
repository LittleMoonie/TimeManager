import { History } from '@mui/icons-material';
import { Alert, Box, Button, Paper, Skeleton, Stack, Pagination } from '@mui/material';
import { parseISO } from 'date-fns';
import { addWeeks } from 'date-fns';
import { isAfter } from 'date-fns';
import { isBefore } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';

import { SegmentedControl } from '@/components/SegmentedControl';
import { AppBreadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useActionCodes, useTimesheet, useTimesheetHistory } from '@/hooks/useTimesheet';
import { ActionCode, TimesheetEntry } from '@/lib/api';

import DayLogView from './DayLogView';
import { TimesheetHistoryItem } from './TimesheetHistoryPanel';
import TimesheetHistoryPanel from './TimesheetHistoryPanel';
import {
  formatWeekRange,
  getWeekDeadline,
  getWeekDates,
  getWeekStart,
  isPastDeadline,
  toISODate,
} from './utils';
import WeekGridView from './WeekGridView';

type ViewMode = 'week' | 'day';

const formatDateList = (dates: string[]) =>
  dates
    .map((iso) =>
      new Date(iso).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    )
    .join(', ');

const getBannerForTimesheet = (
  timesheet: TimesheetEntry[] | undefined,
  weekStart: Date,
  now: Date,
) => {
  const deadline = getWeekDeadline(weekStart);
  const deadlineLabel = deadline.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const deadlineDateLabel = deadline.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  if (!timesheet || timesheet.length === 0) {
    return {
      severity: 'info' as const,
      message: `This week auto-sends ${deadlineDateLabel} at ${deadlineLabel}.`,
    };
  }

  const attentionRequiredEntries = timesheet.filter(
    (entry) => entry.status === 'attention-required',
  );
  if (attentionRequiredEntries.length > 0) {
    const missingReasonsDates = attentionRequiredEntries.map((entry) => entry.day);
    return {
      severity: 'warning' as const,
      message: `Auto-send attempted Friday 6:00 PM. Action required for: ${formatDateList(missingReasonsDates)}.`,
    };
  }

  const sentEntries = timesheet.filter((entry) => entry.status === 'sent');
  if (sentEntries.length > 0) {
    const submittedAt = sentEntries[0].updatedAt; // Assuming all entries for a week are submitted at the same time
    return {
      severity: 'success' as const,
      message: `Week submitted on ${new Date(submittedAt ?? '').toLocaleString()}.`,
    };
  }

  if (isPastDeadline(weekStart, now)) {
    return {
      severity: 'warning' as const,
      message: `Auto-send attempted Friday 6:00 PM. Review and supply any missing reasons.`,
    };
  }

  return {
    severity: 'info' as const,
    message: `This week auto-sends ${deadlineDateLabel} at ${deadlineLabel}.`,
  };
};

const TimesheetPage = () => {
  const [view, setView] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [codeIds, setCodeIds] = useState<ActionCode['id'][]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

  const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate]);
  const weekStartISO = toISODate(weekStart);

  const actionCodesQuery = useActionCodes();
  const historyQuery = useTimesheetHistory();

  const timesheetHook = useTimesheet(weekStartISO, page, limit);
  const timesheetQuery = timesheetHook?.timesheetQuery;
  const createTimeEntry = timesheetHook?.createTimeEntry;
  const updateTimeEntry = timesheetHook?.updateTimeEntry;
  const deleteTimeEntry = timesheetHook?.deleteTimeEntry;
  const approveTimeEntry = timesheetHook?.approveTimeEntry;
  const rejectTimeEntry = timesheetHook?.rejectTimeEntry;
  const helpers = timesheetHook?.helpers;

  const timesheet = timesheetQuery?.data?.data;
  const currentWeekStart = getWeekStart(new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setCodeIds([]);
  }, [weekStartISO]);

  useEffect(() => {
    if (!timesheet) return;
    setCodeIds((prev: ActionCode['id'][]) => {
      const existing = timesheet.flatMap((entry) => entry.actionCode.id);
      const set = new Set([...prev, ...existing]);
      return Array.from(set);
    });
  }, [timesheet]);

  const actionCodes = useMemo(() => actionCodesQuery.data ?? [], [actionCodesQuery.data]);
  const actionCodeRows: ActionCode['id'][] = useMemo(() => {
    if (!actionCodes.length) return [];
    return codeIds.map(
      (codeId) =>
        actionCodes.find((code) => code.id === codeId) ?? {
          id: codeId,
          name: codeId,
          code: codeId,
          type: 'billable',
        },
    );
  }, [codeIds, actionCodes]);

  const availableCodes = useMemo(
    () => actionCodes.filter((code) => !codeIds.includes(code.id)),
    [actionCodes, codeIds],
  );

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {} as Record<string, number>;
    if (!timesheet) return totals;

    weekDates.forEach((date) => {
      const iso = toISODate(date) as string;
      let dayTotal = 0;
      timesheet.forEach((entry) => {
        if (entry.day === iso) {
          dayTotal += entry.durationMin;
        }
      });
      totals[iso] = dayTotal;
    });
    return totals;
  }, [weekDates, timesheet]);

  const banner = getBannerForTimesheet(timesheet, weekStart, now);
  const isPastWeek = isBefore(weekStart, currentWeekStart) as boolean;
  const isAttentionRequired = timesheet?.some((entry) => entry.status === 'attention-required');
  const readOnly = isPastWeek && !isAttentionRequired;
  const weekendOverrides =
    timesheet?.filter((entry) => entry.workMode === 'weekend-override') ?? [];

  const handleAddActionCode = (code: ActionCode) => {
    if (readOnly) return;
    setCodeIds((prev: ActionCode['id'][]) => (prev.includes(code.id) ? prev : [...prev, code.id]));
  };

  const handleRemoveActionCode = async (codeId: ActionCode['id']) => {
    if (readOnly || !timesheet) return;

    setCodeIds((prev: ActionCode['id'][]) => prev.filter((id) => id !== codeId));

    const entriesToDelete = timesheet.filter((entry) => entry.actionCode.id === codeId);

    for (const entry of entriesToDelete) {
      await deleteTimeEntry.mutateAsync(entry.id);
    }
  };

  const handleViewDay = (date: Date) => {
    setSelectedDate(date);
    setView('day');
  };

  const handleNavigateWeek = (direction: number) => {
    const nextWeek = addWeeks(weekStart, direction);
    if (direction > 0 && (isAfter(nextWeek, currentWeekStart) as boolean)) {
      return;
    }
    const nextWeekISO = toISODate(nextWeek);
    const currentWeekISO = toISODate(currentWeekStart) as string;
    const today = new Date();
    const nextSelectedDate = nextWeekISO === currentWeekISO ? today : nextWeek;
    setSelectedDate(nextSelectedDate);
    setView('week');
  };

  const handleUpdateCell = async ({
    code,
    dateISO,
    entry,
  }: {
    code: ActionCode['id'];
    dateISO: string;
    entry: { minutes: number; note?: string; location: { mode: string; country: string } };
  }) => {
    if (!timesheet || readOnly) return;

    const existingEntry = timesheet.find(
      (e: TimesheetEntry) => e.actionCode.id === code && e.day === (dateISO as string),
    ) as TimesheetEntry;

    if (existingEntry) {
      await updateTimeEntry.mutateAsync({
        id: existingEntry.id,
        entry: {
          durationMin: entry.minutes,
          note: entry.note,
        },
      });
    } else {
      await createTimeEntry.mutateAsync({
        actionCodeId: code,
        day: new Date(dateISO),
        durationMin: entry.minutes,
        note: entry.note,
        workMode: entry.location.mode.toLowerCase() as 'office' | 'remote' | 'hybrid',
        country: entry.location.country,
      });
    }

    setCodeIds((prev: ActionCode['id'][]) => (prev.includes(code) ? prev : [...prev, code]));
  };

  const handleDuplicateForward = async ({
    targetDateISO,
    code,
    entry,
  }: {
    targetDateISO: string;
    code: ActionCode['id'];
    entry: { minutes: number; note?: string; location: { mode: string; country: string } };
  }) => {
    if (!timesheet || readOnly) return;
    await createTimeEntry.mutateAsync({
      actionCodeId: code,
      day: new Date(targetDateISO),
      durationMin: entry.minutes,
      note: entry.note,
      workMode: entry.location.mode.toLowerCase() as 'office' | 'remote' | 'hybrid',
      country: entry.location.country,
    });
  };

  const handleClearCell = async (code: ActionCode['id'], dateISO: string) => {
    if (!timesheet || readOnly) return;

    const entry = timesheet.find(
      (e: TimesheetEntry) => e.actionCode.id === code && e.day === dateISO,
    );

    if (entry) {
      await deleteTimeEntry.mutateAsync(entry.id);
    }
  };

  const autoSendTriggeredRef = useRef(false);

  useEffect(() => {
    autoSendTriggeredRef.current = false;
  }, [weekStartISO]);

  useEffect(() => {
    if (!timesheet) return;
    const sheetWeek = getWeekStart(parseISO(timesheet[0].day.toISOString())) as Date;
    if (toISODate(sheetWeek) !== toISODate(weekStart)) {
      setSelectedDate(sheetWeek);
      setView('week');
    }
  }, [timesheet, weekStart]);

  const isLoading = timesheetQuery.isLoading || actionCodesQuery.isLoading;

  const handleChangeView = (next: ViewMode) => {
    if (next === 'day') {
      const today = new Date();
      const currentWeekISO = toISODate(currentWeekStart) as string;
      const selectedWeekISO = toISODate(weekStart);
      if (currentWeekISO === selectedWeekISO && toISODate(selectedDate) === toISODate(weekStart)) {
        setSelectedDate(today);
      }
    }
    setView(next);
  };

  const dailyMin = useMemo(() => {
    return timesheet?.reduce((total, entry) => total + entry.durationMin, 0) ?? 0;
  }, [timesheet]);
  const weeklyMin = useMemo(() => {
    return timesheet?.reduce((total, entry) => total + entry.durationMin, 0) ?? 0;
  }, [timesheet]);

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Stack spacing={3}>
        <AppBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Time' }]} />

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <Stack spacing={3}>
            <PageHeader
              title="Time"
              subtitle={`Week of ${formatWeekRange(weekStart)}`}
              actions={
                <Stack direction="row" spacing={1} alignItems="center">
                  <SegmentedControl
                    value={view}
                    onChange={handleChangeView}
                    options={[
                      { value: 'week', label: 'Week' },
                      { value: 'day', label: 'Day' },
                    ]}
                    ariaLabel="Timesheet view selector"
                  />
                  <Button
                    variant="outlined"
                    startIcon={<History />}
                    onClick={() => setHistoryOpen(true)}
                  >
                    Timesheet history
                  </Button>
                </Stack>
              }
            />

            <Stack spacing={2}>
              <Alert severity={banner.severity}>{banner.message}</Alert>

              {timesheet?.some((entry) => entry.status === 'attention-required') && (
                <Alert severity="warning">
                  Pending reasons for:{' '}
                  {formatDateList(timesheet.map((entry) => entry.day.toISOString()))}. Select each
                  day to add a reason and save.
                </Alert>
              )}

              {readOnly && (
                <Alert severity="info">
                  Previous weeks are view-only. Contact your manager if you need to make
                  adjustments.
                </Alert>
              )}
            </Stack>

            {isLoading && (
              <Stack spacing={2}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 2 }} />
              </Stack>
            )}

            {!isLoading && (
              <>
                {view === 'week' && (
                  <WeekGridView
                    weekStart={weekStart}
                    timesheet={timesheet}
                    actionCodeRows={actionCodeRows}
                    selectedDate={selectedDate}
                    onViewDay={handleViewDay}
                    onNavigateWeek={handleNavigateWeek}
                    onAddActionCode={handleAddActionCode}
                    availableCodes={availableCodes}
                    onUpdateCell={handleUpdateCell}
                    onClearCell={handleClearCell}
                    onDuplicateForward={handleDuplicateForward}
                    dailyTotals={dailyTotals}
                    weeklyTotal={helpers.weeklyTotal}
                    weeklyMin={weeklyMin}
                    dailyMin={dailyMin}
                    readOnly={readOnly}
                    weekendOverrides={weekendOverrides.map((entry) => entry.day.toISOString())}
                    currentWeekStart={currentWeekStart}
                    onRemoveActionCode={handleRemoveActionCode}
                  />
                )}

                {view === 'day' && (
                  <DayLogView
                    date={selectedDate}
                    timesheet={timesheet}
                    actionCodes={actionCodes}
                    onChangeDate={(nextDate) => setSelectedDate(nextDate)}
                    dailyMin={dailyMin}
                    weekStart={weekStart}
                  />
                )}
              </>
            )}

            {timesheetQuery.data && timesheetQuery.data.lastPage > 1 && (
              <Pagination
                count={timesheetQuery.data.lastPage}
                page={page}
                onChange={(_, value) => setPage(value)}
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
              />
            )}

            {/* Approval/Rejection UI */}
            {isManagerOrAdmin &&
              timesheet &&
              timesheet.length > 0 &&
              !readOnly && ( // Only show if there are entries and not read-only
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      // Implement approval logic here
                      // For example, approve the first entry for now
                      if (timesheet[0]) {
                        approveTimeEntry.mutateAsync(timesheet[0].id);
                      }
                    }}
                  >
                    Approve Week
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      // Implement rejection logic here
                      // For example, reject the first entry for now
                      if (timesheet[0]) {
                        rejectTimeEntry.mutateAsync({
                          id: timesheet[0].id,
                          reason: 'Rejected by manager',
                        });
                      }
                    }}
                  >
                    Reject Week
                  </Button>
                </Stack>
              )}
          </Stack>
        </Paper>
      </Stack>

      <TimesheetHistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={(historyQuery.data as TimesheetHistoryItem[]) ?? []}
        onSelectWeek={(weekISO) => {
          const weekDate = getWeekStart(parseISO(weekISO)) as Date;
          setSelectedDate(weekDate);
          setView('week');
        }}
      />
    </Box>
  );
};

export default TimesheetPage;
