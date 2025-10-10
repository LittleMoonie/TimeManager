import { useCallback, useEffect, useMemo, useState } from 'react'

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
} from '@mui/icons-material'
import { COUNTRIES } from '@/constants/countries'
import type { ActionCode, ActionCodeId, CellEntry, ISODate, Timesheet, WorkMode } from '@/types'
import { alpha, useTheme } from '@mui/material/styles'
import { addWeeks, isAfter, isWeekend, parseISO } from 'date-fns'
import {
  analyzeIntervals,
  buildMeridianTime,
  ensureMeridianTime,
  formatDayLabel,
  formatIntervalsWithTotal,
  formatMinutes,
  formatWeekRange,
  getWeekDates,
  splitMeridianTime,
  to24HourTime,
  toISODate,
} from './utils'
import type { IntervalAnalysis, Meridian } from './utils'

const MERIDIANS: Meridian[] = ['AM', 'PM']

type EditorIntervalEndPoints = {
  time: string
  period: Meridian
}

type EditorInterval = {
  start: EditorIntervalEndPoints
  end: EditorIntervalEndPoints
}

const createEmptyEditorInterval = (): EditorInterval => ({
  start: { time: '', period: 'AM' },
  end: { time: '', period: 'AM' },
})

const toEditorInterval = (interval: { start: string; end: string }): EditorInterval => {
  const startMeridian = splitMeridianTime(ensureMeridianTime(interval.start))
  const endMeridian = splitMeridianTime(ensureMeridianTime(interval.end))
  return {
    start: { time: startMeridian.time, period: startMeridian.period },
    end: { time: endMeridian.time, period: endMeridian.period },
  }
}

const editorIntervalToDisplay = (endpoint: EditorIntervalEndPoints) => {
  const trimmed = endpoint.time.trim()
  return trimmed ? buildMeridianTime(trimmed, endpoint.period) : ''
}

const editorIntervalsToStrings = (intervals: EditorInterval[]) =>
  intervals.map(interval => ({
    start: editorIntervalToDisplay(interval.start),
    end: editorIntervalToDisplay(interval.end),
  }))

const mapIntervalsForApi = (intervals: EditorInterval[]) =>
  intervals
    .map(interval => {
      const startDisplay = editorIntervalToDisplay(interval.start)
      const endDisplay = editorIntervalToDisplay(interval.end)
      if (!startDisplay || !endDisplay) {
        return null
      }
      const start = to24HourTime(startDisplay) || startDisplay
      const end = to24HourTime(endDisplay) || endDisplay
      return { start, end }
    })
    .filter((interval): interval is { start: string; end: string } => Boolean(interval))

interface CellEditorState {
  minutes: number
  mode: WorkMode
  country: string
  note: string
  intervals: EditorInterval[]
}

const MAX_DAY_MINUTES = 24 * 60

interface WeekGridViewProps {
  weekStart: Date
  timesheet?: Timesheet
  actionCodeRows: ActionCode[]
  selectedDate: Date
  onViewDay: (date: Date) => void
  onNavigateWeek: (direction: number) => void
  onAddActionCode: (actionCode: ActionCode) => void
  availableCodes: ActionCode[]
  onUpdateCell: (params: {
    code: ActionCodeId
    dateISO: ISODate
    entry: { minutes: number, note?: string, location: { mode: WorkMode, country: string } }
  }) => Promise<void>
  onClearCell: (code: ActionCodeId, dateISO: ISODate) => Promise<void>
  onDuplicateForward: (params: {
    targetDateISO: ISODate
    code: ActionCodeId
    entry: CellEntry
  }) => Promise<void>
  
  dailyTotals: Record<ISODate, number>
  weeklyTotal: number
  weeklyMin: number
  dailyMin: number
  
  readOnly: boolean
  weekendOverrides: ISODate[]
  currentWeekStart: Date
}

const defaultEditorState = (entry?: { minutes: number, note?: string, intervals?: { start: string; end: string }[], location: { mode: WorkMode, country: string } }): CellEditorState => ({
  minutes: entry?.minutes ?? 0,
  mode: entry?.location.mode ?? 'Office',
  country: entry?.location.country ?? 'US',
  note: entry?.note ?? '',
  intervals: entry?.intervals?.map(interval => toEditorInterval(interval)) ?? [],
})

const hasEditorContent = (state: CellEditorState) => {
  return state.intervals.some(
    interval => interval.start.time.trim().length > 0 && interval.end.time.trim().length > 0
  )
}

const computeDayMinutes = (
  timesheet: Timesheet | undefined,
  dateISO: ISODate,
  excludeCode?: ActionCodeId
) => {
  if (!timesheet) return 0
  return timesheet.entries.reduce((total, entry) => {
    if (entry.day === dateISO && (!excludeCode || entry.actionCode.id !== excludeCode)) {
      return total + entry.durationMin
    }
    return total
  }, 0)
}

const INTERVAL_INVALID_ERROR =
  'Intervals must be valid HH:MM AM/PM ranges with the end time after the start.'
const INTERVAL_INCOMPLETE_ERROR = 'Complete both start and end times for each interval.'
const TIME_REQUIRED_ERROR = 'Add at least one interval before saving.'

const getCellEntry = (timesheet: Timesheet | undefined, code: ActionCodeId, dateISO: ISODate) =>
  timesheet?.entries.find(entry => entry.actionCode.id === code && entry.day === dateISO)

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
  
  dailyTotals,
  weeklyTotal,
  weeklyMin,
  dailyMin,
  
  readOnly,
  weekendOverrides,
  currentWeekStart,
}: WeekGridViewProps) => {
  const theme = useTheme()
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart])
  const weekendOverrideSet = useMemo(() => new Set(weekendOverrides), [weekendOverrides])
  const nextWeekStart = useMemo(() => addWeeks(weekStart, 1), [weekStart])
  const disableNextWeek = useMemo(
    () => isAfter(nextWeekStart, currentWeekStart),
    [nextWeekStart, currentWeekStart]
  )
  const [addCodeOpen, setAddCodeOpen] = useState(false)
  const [cellAnchor, setCellAnchor] = useState<HTMLElement | null>(null)
  const [editingKey, setEditingKey] = useState<{ code: ActionCodeId; dateISO: ISODate } | null>(
    null
  )
  const [editorState, setEditorState] = useState<CellEditorState>(defaultEditorState())
  const [error, setError] = useState<string | null>(null)


  const entryLimit = useMemo(() => {
    if (!editingKey) return MAX_DAY_MINUTES
    const { dateISO, code } = editingKey
    const otherMinutes = computeDayMinutes(timesheet, dateISO, code)
    return Math.max(0, MAX_DAY_MINUTES - otherMinutes)
  }, [timesheet, editingKey])

  const exceedsDayLimit = (dateISO: ISODate, minutes: number, code: ActionCodeId) => {
    const otherMinutes = computeDayMinutes(timesheet, dateISO, code)
    return otherMinutes + Math.max(0, minutes) > MAX_DAY_MINUTES
  }

  useEffect(() => {
    if (readOnly && addCodeOpen) {
      setAddCodeOpen(false)
    }
  }, [readOnly, addCodeOpen])

  useEffect(() => {
    if (error === TIME_REQUIRED_ERROR && hasEditorContent(editorState)) {
      setError(null)
    }
  }, [editorState, error])

  const applyIntervalsUpdate = useCallback(
    (updater: (prev: CellEditorState['intervals']) => CellEditorState['intervals']) => {
      let analysis: IntervalAnalysis | null = null
      setEditorState(prev => {
        const nextIntervals = updater(prev.intervals)
        const nextState: CellEditorState = { ...prev, intervals: nextIntervals }
        const serialized = editorIntervalsToStrings(nextIntervals)
        const nextAnalysis = analyzeIntervals(serialized)
        analysis = nextAnalysis
        if (nextAnalysis.kind === 'ok') {
          nextState.minutes = nextAnalysis.totalMinutes
        } else if (nextAnalysis.kind === 'empty') {
          nextState.minutes = 0
        }
        return nextState
      })

      const finalAnalysis = analysis ?? ({ kind: 'empty' } as IntervalAnalysis)

      if (finalAnalysis.kind === 'invalid') {
        setError(INTERVAL_INVALID_ERROR)
      } else if (finalAnalysis.kind === 'partial') {
        setError(INTERVAL_INCOMPLETE_ERROR)
      } else {
        setError(prevError =>
          prevError === INTERVAL_INVALID_ERROR || prevError === INTERVAL_INCOMPLETE_ERROR
            ? null
            : prevError
        )
      }
    },
    [setError]
  )

  

  const handleOpenEditor = (
    event: React.MouseEvent<HTMLElement>,
    code: ActionCodeId,
    dateISO: ISODate
  ) => {
    if (readOnly || (isWeekend(parseISO(dateISO)) && !weekendOverrideSet.has(dateISO))) {
      return
    }
    setCellAnchor(event.currentTarget)
    setEditingKey({ code, dateISO })
    const entry = getCellEntry(timesheet, code, dateISO)
    setEditorState(defaultEditorState(entry))
    setError(null)
  }

  const handleCloseEditor = () => {
    setCellAnchor(null)
    setEditingKey(null)
    setError(null)
  }

  const updateIntervalAt = (
    index: number,
    updater: (current: EditorInterval) => EditorInterval
  ) => {
    applyIntervalsUpdate(prevIntervals => {
      const next = [...prevIntervals]
      const current = next[index] ?? createEmptyEditorInterval()
      next[index] = updater(current)
      return next
    })
  }

  const handleIntervalTimeChange = (index: number, field: 'start' | 'end', value: string) => {
    const trimmed = value.trim()
    updateIntervalAt(index, current => {
      if (field === 'start') {
        return {
          ...current,
          start: {
            time: trimmed,
            period: current.start.period,
          },
        }
      }
      const enforcedPeriod = current.start.period === 'PM' ? 'PM' : current.end.period
      return {
        ...current,
        end: {
          time: trimmed,
          period: enforcedPeriod,
        },
      }
    })
  }

  const handleIntervalPeriodChange = (index: number, field: 'start' | 'end', period: Meridian) => {
    updateIntervalAt(index, current => {
      if (field === 'start') {
        const nextEnd =
          period === 'PM' && current.end.period === 'AM'
            ? { ...current.end, period: 'PM' as Meridian }
            : current.end
        return {
          ...current,
          start: {
            ...current.start,
            period,
          },
          end: nextEnd,
        }
      }

      if (current.start.period === 'PM' && period === 'AM') {
        return {
          ...current,
          end: {
            ...current.end,
            period: 'PM' as Meridian,
          },
        }
      }

      return {
        ...current,
        end: {
          ...current.end,
          period,
        },
      }
    })
  }

  const handleAddInterval = () => {
    applyIntervalsUpdate(prevIntervals => [...prevIntervals, createEmptyEditorInterval()])
  }

  const handleRemoveInterval = (index: number) => {
    applyIntervalsUpdate(prevIntervals => prevIntervals.filter((_, idx) => idx !== index))
  }

  const handleSaveCell = async () => {
    if (!editingKey) return
    if (!editorState.country) {
      setError('Country is required')
      return
    }
    if (!editorState.mode) {
      setError('Work mode is required')
      return
    }

    if (!hasEditorContent(editorState)) {
      setError(TIME_REQUIRED_ERROR)
      return
    }

    const intervalAnalysis = analyzeIntervals(editorIntervalsToStrings(editorState.intervals))
    if (intervalAnalysis.kind === 'invalid') {
      setError(INTERVAL_INVALID_ERROR)
      return
    }
    if (intervalAnalysis.kind === 'partial' || intervalAnalysis.kind === 'empty') {
      setError(TIME_REQUIRED_ERROR)
      return
    }
    const mappedIntervals = mapIntervalsForApi(editorState.intervals)
    if (!mappedIntervals.length) {
      setError(TIME_REQUIRED_ERROR)
      return
    }
    const nextMinutes = intervalAnalysis.totalMinutes

    if (exceedsDayLimit(editingKey.dateISO, nextMinutes, editingKey.code)) {
      setError('Day total cannot exceed 24h (1440 minutes).')
      return
    }

    const entry: { minutes: number, note?: string, intervals: { start: string; end: string }[], location: { mode: WorkMode, country: string }, sent?: boolean, deficitReason?: string } = {
      note: editorState.note || undefined,
      intervals: mappedIntervals,
      location: {
        mode: editorState.mode,
        country: editorState.country,
      },
      sent: getCellEntry(timesheet, editingKey.code, editingKey.dateISO)?.sent ?? false,
      deficitReason: getCellEntry(timesheet, editingKey.code, editingKey.dateISO)?.deficitReason,
    }

    await onUpdateCell({
      code: editingKey.code,
      dateISO: editingKey.dateISO,
      entry,
    })
    handleCloseEditor()
  }

  const handleClearCell = async () => {
    if (!editingKey) return
    await onClearCell(editingKey.code, editingKey.dateISO)
    handleCloseEditor()
  }

  const handleDuplicateNext = async () => {
    if (!editingKey) return
    const currentIndex = weekDates.findIndex(date => toISODate(date) === editingKey.dateISO)
    if (currentIndex === -1 || currentIndex === weekDates.length - 1) {
      setError('No next day available in this week')
      return
    }
    const nextDateISO = toISODate(weekDates[currentIndex + 1])
    if (readOnly || (isWeekend(parseISO(nextDateISO)) && !weekendOverrideSet.has(nextDateISO))) {
      setError('Next day is locked.')
      return
    }
    const intervalAnalysis = analyzeIntervals(editorIntervalsToStrings(editorState.intervals))
    if (intervalAnalysis.kind !== 'ok') {
      setError('Complete intervals before copying.')
      return
    }
    const mappedIntervals = mapIntervalsForApi(editorState.intervals)
    if (!mappedIntervals.length) {
      setError('Complete intervals before copying.')
      return
    }
    const copyMinutes = intervalAnalysis.totalMinutes

    if (exceedsDayLimit(nextDateISO, copyMinutes, editingKey.code)) {
      setError('Copying would exceed 24h for the next day.')
      return
    }

    const entry: CellEntry = {
      minutes: copyMinutes,
      note: editorState.note || undefined,
      intervals: mappedIntervals,
      location: {
        mode: editorState.mode,
        country: editorState.country,
      },
    }

    await onDuplicateForward({
      targetDateISO: nextDateISO,
      code: editingKey.code,
      entry,
    })
    setError(null)
  }

  const handleDuplicateWeek = async () => {
    if (!editingKey) return
    const eligibleDates = weekDates
      .map(date => ({ date, iso: toISODate(date) }))
      .filter(({ iso }) => iso !== editingKey.dateISO)
      .filter(({ date, iso }) => !(isWeekend(date) && !weekendOverrideSet.has(iso)))
    if (!eligibleDates.length) {
      setError('No eligible days available in this week.')
      return
    }
    const intervalAnalysis = analyzeIntervals(editorIntervalsToStrings(editorState.intervals))
    if (intervalAnalysis.kind !== 'ok') {
      setError('Complete intervals before copying.')
      return
    }
    const mappedIntervals = mapIntervalsForApi(editorState.intervals)
    if (!mappedIntervals.length) {
      setError('Complete intervals before copying.')
      return
    }
    const copyMinutes = intervalAnalysis.totalMinutes

    const entry: { minutes: number, note?: string, intervals: { start: string; end: string }[], location: { mode: WorkMode, country: string } } = {
      minutes: copyMinutes,
      note: editorState.note || undefined,
      intervals: mappedIntervals,
      location: {
        mode: editorState.mode,
        country: editorState.country,
      },
    }

    try {
      for (const target of eligibleDates) {
        await onDuplicateForward({
          targetDateISO: target.iso,
          code: editingKey.code,
          entry,
        })
      }
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Unable to copy to the entire week. Please try again.')
    }
  }

  const rowTotals = useMemo(() => {
    if (!timesheet) return {}
    return timesheet.entries.reduce<Record<ActionCodeId, number>>(
      (acc, entry) => {
        acc[entry.actionCode.id] = (acc[entry.actionCode.id] ?? 0) + entry.durationMin
        return acc
      },
      {}
    )
  }, [timesheet])

  const footerTotals = useMemo(() => {
    const weekMinutes = weeklyTotal
    const deficit = Math.max(0, weeklyMin - weekMinutes)
    const overtime = Math.max(0, weekMinutes - weeklyMin)
    return { weekMinutes, deficit, overtime }
  }, [weeklyTotal, weeklyMin])

  const [codeInput, setCodeInput] = useState('')
  const weekHasLoggedMinutes = weeklyTotal > 0
  const showNoWeekHoursMessage = readOnly && !weekHasLoggedMinutes
  const canSave = useMemo(() => {
    if (!editorState.country.trim() || !editorState.mode) {
      return false
    }
    const analysis = analyzeIntervals(editorIntervalsToStrings(editorState.intervals))
    if (analysis.kind !== 'ok') {
      return false
    }
    if (editingKey) {
      return analysis.totalMinutes <= entryLimit
    }
    return true
  }, [editorState, entryLimit, editingKey])

  return (
    <Stack spacing={2.5}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton aria-label="Previous week" onClick={() => onNavigateWeek(-1)} size="small">
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

        <Box display="flex" gap={1} alignItems="center">
          {showNoWeekHoursMessage ? (
            <Typography variant="body2" color="text.secondary">
              No hours done this week.
            </Typography>
          ) : (
            <Button
              variant={addCodeOpen ? 'contained' : 'outlined'}
              startIcon={<Add />}
              onClick={() => {
                if (readOnly) return
                setAddCodeOpen(prev => !prev)
              }}
              aria-expanded={addCodeOpen}
              aria-controls="add-action-code-panel"
              disabled={readOnly}
            >
              Add action code
            </Button>
          )}
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
                  Pick a code to track across the grid. You can adjust the hours for each day
                  afterward.
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
                groupBy={option => option.project ?? 'General'}
                getOptionLabel={option => `${option.id} — ${option.label}`}
                inputValue={codeInput}
                onInputChange={(_, value) => setCodeInput(value)}
                onChange={(_, value) => {
                  if (value) {
                    onAddActionCode(value)
                    setCodeInput('')
                    setAddCodeOpen(false)
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
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Action code"
                    placeholder="Search or type (e.g., DEV-2103)"
                    helperText="Codes follow pattern ABCD-1234"
                  />
                )}
                filterOptions={(options, state) =>
                  options.filter(
                    option =>
                      option.id.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                      option.label.toLowerCase().includes(state.inputValue.toLowerCase())
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
              {weekDates.map(date => {
                const iso = toISODate(date)
                const total = dailyTotals[iso] ?? 0
                const isActive = toISODate(selectedDate) === iso
                const isDeficit = total > 0 && total < dailyMin
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
                )
              })}
              <TableCell align="center">Row total</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {actionCodeRows.length > 0 ? (
              actionCodeRows.map(code => {
                const accentColor = code.color ?? theme.palette.primary.main
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
                                onClick={() => {}}
                                disabled={readOnly}
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
                    {weekDates.map(date => {
                      const iso = toISODate(date)
                      const entry = getCellEntry(timesheet, code.id, iso)
                      const minutes = entry?.minutes ?? 0
                      const missingLocation = entry && !entry.location?.country
                      const sent = entry?.sent
                      const weekendLocked = isWeekend(date) && !weekendOverrideSet.has(iso)
                      const locked = readOnly || weekendLocked
                      const intervalSummary =
                        entry?.intervals && entry.intervals.length
                          ? formatIntervalsWithTotal(entry.intervals, minutes)
                          : null
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
                            <Typography variant="body2" fontWeight={500} textAlign="center">
                              {intervalSummary ?? 'No intervals'}
                            </Typography>
                            {entry?.location && (
                              <Typography variant="caption" color="text.secondary">
                                {entry.location.mode} · {entry.location.country}
                              </Typography>
                            )}
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
                            {!locked ? (
                              <Button
                                size="small"
                                variant="text"
                                onClick={event => handleOpenEditor(event, code.id, iso)}
                                endIcon={<Edit fontSize="inherit" />}
                                aria-label={`Edit ${code.id} on ${iso}`}
                              >
                                Edit
                              </Button>
                            ) : (
                              !weekendLocked && (
                                <Tooltip
                                  title={
                                    readOnly
                                      ? 'Previous weeks are read-only'
                                      : 'Weekend requires approval'
                                  }
                                >
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
                              )
                            )}
                          </Stack>
                        </TableCell>
                      )
                    })}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {rowTotals[code.id] ? formatMinutes(rowTotals[code.id]) : '0m'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : showNoWeekHoursMessage ? (
              <TableRow>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    Timesheet locked
                  </Typography>
                </TableCell>
                {weekDates.map(date => (
                  <TableCell key={toISODate(date)} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hours done
                    </Typography>
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Typography variant="body2" color="text.secondary">
                    No hours done this week
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
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
              {weekDates.map(date => {
                const iso = toISODate(date)
                const total = dailyTotals[iso] ?? 0
                return (
                  <TableCell key={iso} align="center">
                    <Typography variant="body2" fontWeight={600}>
                      {total ? formatMinutes(total) : '0m'}
                    </Typography>
                  </TableCell>
                )
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

            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Intervals</Typography>
                <Button
                  size="small"
                  onClick={handleAddInterval}
                  startIcon={<Add fontSize="small" />}
                >
                  Add interval
                </Button>
              </Box>
              {editorState.intervals.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  Add at least one interval with a start and end time.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {editorState.intervals.map((interval, index) => {
                    const allowedEndMeridians =
                      interval.start.period === 'PM' ? (['PM'] as Meridian[]) : MERIDIANS
                    const normalizedEndPeriod = allowedEndMeridians.includes(interval.end.period)
                      ? interval.end.period
                      : allowedEndMeridians[0]
                    return (
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
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              spacing={1}
                              alignItems={{ sm: 'center' }}
                            >
                              <TextField
                                label="Start"
                                value={interval.start.time}
                                onChange={event =>
                                  handleIntervalTimeChange(index, 'start', event.target.value)
                                }
                                inputProps={{ placeholder: '09:00' }}
                                size="small"
                              />
                              <TextField
                                label="AM/PM"
                                value={interval.start.period}
                                onChange={event =>
                                  handleIntervalPeriodChange(
                                    index,
                                    'start',
                                    event.target.value as Meridian
                                  )
                                }
                                select
                                size="small"
                                sx={{ width: 100 }}
                              >
                                {MERIDIANS.map(meridian => (
                                  <MenuItem key={meridian} value={meridian}>
                                    {meridian}
                                  </MenuItem>
                                ))}
                              </TextField>
                              <TextField
                                label="End"
                                value={interval.end.time}
                                onChange={event =>
                                  handleIntervalTimeChange(index, 'end', event.target.value)
                                }
                                inputProps={{ placeholder: '10:15' }}
                                size="small"
                              />
                              <TextField
                                label="AM/PM"
                                value={normalizedEndPeriod}
                                onChange={event =>
                                  handleIntervalPeriodChange(
                                    index,
                                    'end',
                                    event.target.value as Meridian
                                  )
                                }
                                select
                                size="small"
                                sx={{ width: 100 }}
                              >
                                {allowedEndMeridians.map(meridian => (
                                  <MenuItem key={meridian} value={meridian}>
                                    {meridian}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Stack>
                          }
                        />
                      </ListItem>
                    )
                  })}
                </List>
              )}
            </Stack>

            <Divider />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '220px 1fr' },
                gap: 1.5,
                alignItems: 'start',
              }}
            >
              <TextField
                label="Work mode"
                value={editorState.mode}
                onChange={event =>
                  setEditorState(prev => ({
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
                getOptionLabel={option => `${option.code} — ${option.name}`}
                value={
                  COUNTRIES.find(country => country.code === editorState.country) ?? COUNTRIES[0]
                }
                onChange={(_, option) =>
                  setEditorState(prev => ({
                    ...prev,
                    country: option?.code ?? '',
                  }))
                }
                fullWidth
                renderInput={params => <TextField {...params} label="Country" required />}
              />
            </Box>

            <TextField
              label="Note"
              multiline
              minRows={2}
              value={editorState.note}
              onChange={event =>
                setEditorState(prev => ({
                  ...prev,
                  note: event.target.value,
                }))
              }
              placeholder="Why was this time spent?"
            />

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
                <Button onClick={handleCloseEditor} disabled={isRemovingCode}>
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
  )
}

export default WeekGridView
