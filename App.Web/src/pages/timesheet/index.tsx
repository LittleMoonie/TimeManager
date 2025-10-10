import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Box, Button, Paper, Skeleton, Stack } from '@mui/material'
import { History } from '@mui/icons-material'
import { PageHeader } from '@/components/ui/PageHeader'
import { SegmentedControl } from '@/components/SegmentedControl'
import { useActionCodes, useTimesheet, useTimesheetHistory } from '@/hooks/useTimesheet'

import {
  formatWeekRange,
  getWeekDeadline,
  getWeekDates,
  getWeekStart,
  isPastDeadline,
  toISODate,
} from './utils'
import WeekGridView from './WeekGridView'
import DayLogView from './DayLogView'
import TimesheetHistoryPanel from './TimesheetHistoryPanel'
import { AppBreadcrumbs } from '@/components/ui/Breadcrumbs'
  import { ActionCode, ActionCodeId, ISODate, Timesheet, DayMap } from '@/types'
import { parseISO } from 'date-fns'
import { addWeeks } from 'date-fns'
import { isAfter } from 'date-fns'
import { isBefore } from 'date-fns'


type ViewMode = 'week' | 'day'

const formatDateList = (dates: ISODate[]) =>
  dates
    .map(iso =>
      new Date(iso).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    )
    .join(', ')

const getBannerForTimesheet = (timesheet: Timesheet | undefined, weekStart: Date, now: Date) => {
  const deadline = getWeekDeadline(weekStart)
  const deadlineLabel = deadline.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const deadlineDateLabel = deadline.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  if (!timesheet) {
    return {
      severity: 'info' as const,
      message: `This week auto-sends ${deadlineDateLabel} at ${deadlineLabel}.`,
    }
  }

  if (timesheet.status === 'attention-required' && timesheet.missingReasons?.length) {
    return {
      severity: 'warning' as const,
      message: `Auto-send attempted Friday 6:00 PM. Action required for: ${formatDateList(timesheet.missingReasons)}.`,
    }
  }

  if (isPastDeadline(weekStart, now) && timesheet.status !== 'sent') {
    return {
      severity: 'warning' as const,
      message: `Auto-send attempted Friday 6:00 PM. Review and supply any missing reasons.`,
    }
  }

  if (timesheet.status === 'sent') {
    return {
      severity: 'success' as const,
      message: `Week submitted on ${new Date(timesheet.submittedAt ?? '').toLocaleString()}.`,
    }
  }

  return {
    severity: 'info' as const,
    message: `This week auto-sends ${deadlineDateLabel} at ${deadlineLabel}.`,
  }
}

const TimesheetPage = () => {
  const [view, setView] = useState<ViewMode>('week')
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [now, setNow] = useState(() => new Date())
  const [historyOpen, setHistoryOpen] = useState(false)
  const [codeIds, setCodeIds] = useState<ActionCodeId[]>([])

  const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate])
  const weekStartISO = toISODate(weekStart)

  const actionCodesQuery = useActionCodes()
  const historyQuery = useTimesheetHistory()
  
    const { timesheetQuery, createTimeEntry, updateTimeEntry, deleteTimeEntry, helpers } = useTimesheet(weekStartISO)

  const timesheet = timesheetQuery.data
  const currentWeekStart = getWeekStart(new Date())

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date())
    }, 60 * 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    setCodeIds([])
  }, [weekStartISO])

  useEffect(() => {
    if (!timesheet) return
    setCodeIds((prev: ActionCodeId[]) => {
      const existing = timesheet.entries.map((entry) => entry.actionCode.id)
      const set = new Set([...prev, ...existing])
      return Array.from(set)
    })
  }, [timesheet])

  const actionCodes = useMemo(() => actionCodesQuery.data ?? [], [actionCodesQuery.data])
  const actionCodeRows: ActionCode[] = useMemo(() => {
    if (!actionCodes.length) return []
    return codeIds.map(
      codeId => actionCodes.find(code => code.id === codeId) ?? { id: codeId, name: codeId, code: codeId, type: 'billable' }
    )
  }, [codeIds, actionCodes])

  const availableCodes = useMemo(
    () => actionCodes.filter(code => !codeIds.includes(code.id)),
    [actionCodes, codeIds]
  )

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart])
  const dailyTotals = useMemo(() => {
    const totals: Record<ISODate, number> = {} as Record<ISODate, number>
    if (!timesheet) return totals

    weekDates.forEach(date => {
      const iso = toISODate(date) as ISODate
      totals[iso] = timesheet.entries.reduce((total: number, entry) => {
        if (entry.day === iso) {
          return total + entry.durationMin
        }
        return total
      }, 0)
    })
    return totals
  }, [weekDates, timesheet])

  const banner = getBannerForTimesheet(timesheet, weekStart, now)
  const isPastWeek = isBefore(weekStart, currentWeekStart) as boolean
  const isAttentionRequired = timesheet?.status === 'attention-required'
  const readOnly = isPastWeek && !isAttentionRequired
  const weekendOverrides = timesheet?.weekendOverrides ?? []

  const handleAddActionCode = (code: ActionCode) => {
    if (readOnly) return
    setCodeIds((prev: ActionCodeId[]) => (prev.includes(code.id) ? prev : [...prev, code.id]))
  }

  const handleViewDay = (date: Date) => {
    setSelectedDate(date)
    setView('day')
  }

  const handleNavigateWeek = (direction: number) => {
    const nextWeek = addWeeks(weekStart, direction)
    if (direction > 0 && isAfter(nextWeek, currentWeekStart) as boolean) {
      return
    }
    const nextWeekISO = toISODate(nextWeek)
    const currentWeekISO = toISODate(currentWeekStart) as ISODate
    const today = new Date()
    const nextSelectedDate = nextWeekISO === currentWeekISO ? today : nextWeek
    setSelectedDate(nextSelectedDate)
    setView('week')
  }

  const handleUpdateCell = async ({
    code,
    dateISO,
    entry,
  }: {
    code: ActionCodeId
    dateISO: ISODate
    entry: { minutes: number, note?: string, location: { mode: string, country: string } }
  }) => {
    if (!timesheet || readOnly) return

    const existingEntry = timesheet.entries.find((e: DayMap) => e.actionCode.id === code && e.day === dateISO);

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

    setCodeIds((prev: ActionCodeId[]) => (prev.includes(code) ? prev : [...prev, code]))
  }

  const handleDuplicateForward = async ({
    targetDateISO,
    code,
    entry,
  }: {
    targetDateISO: ISODate
    code: ActionCodeId
    entry: { minutes: number, note?: string, location: { mode: string, country: string } }
  }) => {
    if (!timesheet || readOnly) return
    await createTimeEntry.mutateAsync({
      actionCodeId: code,
      day: new Date(targetDateISO),
      durationMin: entry.minutes,
      note: entry.note,
      workMode: entry.location.mode.toLowerCase() as 'office' | 'remote' | 'hybrid',
      country: entry.location.country,
    });
  }

  const handleClearCell = async (code: ActionCodeId, dateISO: ISODate) => {
    if (!timesheet || readOnly) return

    const entry = timesheet.entries.find((e: DayMap) => e.actionCode.id === code && e.day === dateISO);
    if (entry) {
      await deleteTimeEntry.mutateAsync(entry.id);
    }
  }

  

  

  const autoSendTriggeredRef = useRef(false)

  useEffect(() => {
    autoSendTriggeredRef.current = false
  }, [weekStartISO])

  useEffect(() => {
    if (!timesheet) return
    const sheetWeek = getWeekStart(parseISO(timesheet.weekStartISO)) as Date
    if (toISODate(sheetWeek) !== toISODate(weekStart)) {
      setSelectedDate(sheetWeek)
      setView('week')
    }
  }, [timesheet, weekStart])

  

  const isLoading = timesheetQuery.isLoading || actionCodesQuery.isLoading

  const handleChangeView = (next: ViewMode) => {
    if (next === 'day') {
      const today = new Date()
      const currentWeekISO = toISODate(currentWeekStart) as ISODate
      const selectedWeekISO = toISODate(weekStart)
      if (currentWeekISO === selectedWeekISO && toISODate(selectedDate) === toISODate(weekStart)) {
        setSelectedDate(today)
      }
    }
    setView(next)
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Stack spacing={3}>
        <AppBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Time' }]} />

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            backgroundColor: theme => theme.palette.background.paper,
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

              {timesheet?.missingReasons && timesheet.missingReasons.length > 0 && (
                <Alert severity="warning">
                  Pending reasons for: {formatDateList(timesheet.missingReasons)}. Select each day
                  to add a reason and save.
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
                    weeklyMin={timesheet?.weeklyMin ?? 2400}
                    dailyMin={timesheet?.dailyMin ?? 480}
                    
                    readOnly={readOnly}
                    weekendOverrides={weekendOverrides}
                    currentWeekStart={currentWeekStart}
                  />
                )}

                {view === 'day' && (
                  <DayLogView
                    date={selectedDate}
                    timesheet={timesheet}
                    actionCodes={actionCodes}
                    onChangeDate={nextDate => setSelectedDate(nextDate)}
                    
                    dailyMin={timesheet?.dailyMin ?? 480}
                    weekStart={weekStart}
                    
                  />
                )}
              </>
            )}
          </Stack>
        </Paper>
      </Stack>

      <TimesheetHistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={historyQuery.data ?? []}
        onSelectWeek={weekISO => {
          const weekDate = getWeekStart(parseISO(weekISO)) as Date
          setSelectedDate(weekDate)
          setView('week')
        }}
      />
    </Box>
  )
}

export default TimesheetPage
