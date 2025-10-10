import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { timesheetApi } from '@/lib/api/timesheet'
import type { ActionCode, ISODate, Timesheet, TimesheetEntryDto } from '@/types'

export const useActionCodes = () =>
  useQuery<ActionCode[]>({
    queryKey: ['timesheet', 'action-codes'],
    queryFn: () => timesheetApi.getActionCodes(),
    staleTime: Infinity,
  })

export const useTimesheet = (weekStartISO: ISODate) => {
  const queryClient = useQueryClient()

  const timesheetQuery = useQuery<Timesheet>({
    queryKey: ['timesheet', weekStartISO],
    queryFn: () => timesheetApi.getTimesheet(weekStartISO),
    staleTime: 0,
  })

  const createTimeEntry = useMutation({
    mutationFn: async (entry: TimesheetEntryDto) => timesheetApi.createTimeEntry(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', weekStartISO] })
    },
  })

  const updateTimeEntry = useMutation({
    mutationFn: async ({ id, entry }: { id: string; entry: Partial<TimesheetEntryDto> }) =>
      timesheetApi.updateTimeEntry(id, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', weekStartISO] })
    },
  })

  const deleteTimeEntry = useMutation({
    mutationFn: async (id: string) => timesheetApi.deleteTimeEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', weekStartISO] })
    },
  })

  const helpers = useMemo(() => {
    const data = timesheetQuery.data
    if (!data) {
      return {
        computeDayTotal: () => 0,
        weeklyTotal: 0,
      }
    }

    return {
      computeDayTotal: (iso: ISODate) => {
        return data.entries.reduce((total, entry) => {
          if (entry.day === iso) {
            return total + entry.durationMin
          }
          return total
        }, 0)
      },
      weeklyTotal: data.entries.reduce((total, entry) => total + entry.durationMin, 0),
    }
  }, [timesheetQuery.data])

  return {
    timesheetQuery,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    helpers,
  }
}

export const useTimesheetHistory = () =>
  useQuery<Timesheet[]>({
    queryKey: ['timesheet', 'history'],
    queryFn: () => Promise.resolve([]), // This needs to be implemented
    staleTime: 10 * 1000,
  })
