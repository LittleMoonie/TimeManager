import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ActionCode } from '@/lib/api'
import { ActionCodesService, TimeService, TimesheetHistorySummary } from '@/lib/api'
import { TimesheetEntry, TimesheetEntryDto } from '@/lib/api'

export const useActionCodes = () => {
  return useQuery<ActionCode[]>({    queryKey: ['timesheet', 'action-codes'],
    queryFn: () => ActionCodesService.listActionCodes({}),
    staleTime: Infinity,
  })
}

export const useTimesheet = (weekStartISO: string, page: number, limit: number) => {
  const queryClient = useQueryClient()

  const timesheetQuery = useQuery<{ lastPage: number; page: number; total: number; data: TimesheetEntry[] }>({
    queryKey: ['timesheet', weekStartISO, page, limit],
    queryFn: () => TimeService.getWeekTimesheet({ week: weekStartISO, page, limit }),
    staleTime: 0,
    select: (data) => ({
      lastPage: data.lastPage,
      page: data.page,
      total: data.total,
      data: data.data,
    }),
  })


  const createTimeEntry = useMutation({
    mutationFn: async (entry: TimesheetEntryDto) => TimeService.createTimeEntry({ requestBody: entry }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', weekStartISO, page, limit] })
    },
  })

  const updateTimeEntry = useMutation({
    mutationFn: async ({ id, entry }: { id: string; entry: Partial<TimesheetEntryDto> }) =>
      TimeService.updateTimeEntry({ id, requestBody: entry }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', weekStartISO, page, limit] })
    },
  })

  const deleteTimeEntry = useMutation({
    mutationFn: async (id: string) => TimeService.deleteTimeEntry({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', weekStartISO, page, limit] })
    },
  })

  const approveTimeEntry = useMutation({
    mutationFn: async (id: string) => TimeService.approveTimeEntry({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', weekStartISO, page, limit] })
    },
  })

  const rejectTimeEntry = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => TimeService.rejectTimeEntry({ id, requestBody: { reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', weekStartISO, page, limit] })
    },
  })

  const helpers = useMemo(() => {
    const data = timesheetQuery.data?.data
    if (!data) {
      return {
        computeDayTotal: () => 0,
        weeklyTotal: 0,
      }
    }

    return {
      computeDayTotal: (iso: string) => {
        return data.reduce((total, entry) => {
          if (entry.day === iso) {
            return total + entry.durationMin
          }
          return total
        }, 0)
      },
      weeklyTotal: data.reduce((total, entry) => total + entry.durationMin, 0),
    }
  }, [timesheetQuery.data])

  return {
    timesheetQuery,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    approveTimeEntry,
    rejectTimeEntry,
    helpers,
  }
}

export const useTimesheetHistory = () =>

  useQuery<TimesheetHistorySummary[]> ({

    queryKey: ['timesheet', 'history'],

    queryFn: () => TimeService.getTimesheetHistory(),

    staleTime: 10 * 1000,

  })
