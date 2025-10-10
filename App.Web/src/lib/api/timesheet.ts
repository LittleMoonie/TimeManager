import type { ActionCode, Timesheet, TimesheetEntry, TimesheetEntryDto } from '@/types';
import { TimeService } from './index';

export const timesheetApi = {
  getActionCodes: async (): Promise<ActionCode[]> => {
    // This needs to be implemented in the backend
    return [];
  },

  getTimesheet: async (weekStart: string): Promise<Timesheet> => {
    const response = await TimeService.timeControllerGetWeekTimesheet(weekStart);
    return response;
  },

  createTimeEntry: async (entry: TimesheetEntryDto): Promise<TimesheetEntry> => {
    const response = await TimeService.timeControllerCreateTimeEntry(entry);
    return response;
  },

  updateTimeEntry: async (id: string, entry: Partial<TimesheetEntryDto>): Promise<TimesheetEntry> => {
    const response = await TimeService.timeControllerUpdateTimeEntry(id, entry);
    return response;
  },

  deleteTimeEntry: async (id: string): Promise<void> => {
    await TimeService.timeControllerDeleteTimeEntry(id);
  },
};