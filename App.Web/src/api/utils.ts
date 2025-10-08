import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import type { ClockEvent, Organization, TimesheetDay } from '@/types';

dayjs.extend(utc);
dayjs.extend(timezone);

export const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export function normalizeSearch(input?: string) {
  return input?.trim().toLowerCase() ?? '';
}

export function matchSearch(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle);
}

export function aggregateDay(
  events: ClockEvent[],
  org: Organization,
): { workedMinutes: number; late: boolean } {
  const tz = org.settings.timezone;
  const sorted = [...events].sort(
    (a, b) => dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf(),
  );
  let clockIn: dayjs.Dayjs | null = null;
  let breakStart: dayjs.Dayjs | null = null;
  let breakMinutes = 0;
  let worked = 0;
  let late = false;

  sorted.forEach((event) => {
    const ts = dayjs(event.timestamp).tz(tz);
    switch (event.type) {
      case 'IN': {
        if (!clockIn) {
          clockIn = ts;
          const start = ts.hour(9).minute(0).second(0).millisecond(0);
          const grace = start.add(org.settings.latenessGraceMins, 'minute');
          if (ts.isAfter(grace)) {
            late = true;
          }
        }
        break;
      }
      case 'BREAK_START': {
        if (clockIn && !breakStart) {
          breakStart = ts;
        }
        break;
      }
      case 'BREAK_END': {
        if (clockIn && breakStart) {
          breakMinutes += ts.diff(breakStart, 'minute');
          breakStart = null;
        }
        break;
      }
      case 'OUT': {
        if (clockIn) {
          worked += Math.max(ts.diff(clockIn, 'minute') - breakMinutes, 0);
          clockIn = null;
          breakMinutes = 0;
        }
        break;
      }
      default:
        break;
    }
  });

  return { workedMinutes: worked, late };
}

export function buildWeekDays(start: dayjs.Dayjs, org: Organization): TimesheetDay[] {
  const days: TimesheetDay[] = [];
  const base = start.startOf('day');

  for (let i = 0; i < 7; i += 1) {
    const date = base.add(i, 'day');
    const isWeekend = date.day() === 0 || date.day() === 6;
    days.push({
      date: date.toISOString(),
      plannedHours: isWeekend ? 0 : org.settings.workdayHours,
      workedHours: 0,
      late: false,
      absent: !isWeekend,
    });
  }

  return days;
}
