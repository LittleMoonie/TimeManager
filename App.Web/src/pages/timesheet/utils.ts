import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  set,
  startOfWeek,
} from 'date-fns';
import { enUS } from 'date-fns/locale';

import { TimesheetEntry, TimesheetEntryDto } from '@/lib/api';

const defaultLocale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

export const getLocale = () => {
  try {
    return new Intl.Locale(defaultLocale).toString();
  } catch {
    return 'en-US';
  }
};

export const getDateFnsLocale = () => {
  // TODO: load locale dynamically; fallback enUS for mock implementation
  return enUS;
};

export const getWeekStart = (reference: Date) => startOfWeek(reference, { weekStartsOn: 6 });

export const getWeekDates = (weekStart: Date) =>
  Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

export const toISODate = (date: Date): string => format(date, 'yyyy-MM-dd');

export const formatDayLabel = (date: Date) =>
  format(date, 'EEE dd', { locale: getDateFnsLocale() });

export const formatWeekRange = (weekStart: Date) => {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();

  const startFormat = sameMonth ? 'MMM dd' : sameYear ? 'MMM dd' : 'MMM dd, yyyy';
  const endFormat = sameYear ? 'MMM dd, yyyy' : 'MMM dd, yyyy';

  return `${format(weekStart, startFormat)} — ${format(weekEnd, endFormat)}`;
};

export const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
};

export const parseDuration = (input: string): number | null => {
  if (!input) return null;
  const trimmed = input.trim().toLowerCase();
  const colonMatch = /^(\d{1,2}):(\d{1,2})$/.exec(trimmed);
  if (colonMatch) {
    const [, hoursStr, minutesStr] = colonMatch;
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  }

  const hMatch = /^(\d+)\s*h(?:\s*(\d+)\s*m?)?$/.exec(trimmed);
  if (hMatch) {
    const [, hoursStr, minutesStr] = hMatch;
    const hours = Number(hoursStr);
    const minutes = minutesStr ? Number(minutesStr) : 0;
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  }

  const mMatch = /^(\d+)\s*m$/.exec(trimmed);
  if (mMatch) {
    const minutes = Number(mMatch[1]);
    return Number.isNaN(minutes) ? null : minutes;
  }

  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  return null;
};

export const isDateInWeek = (dateISO: string, weekStart: Date) => {
  const date = parseISO(dateISO);
  const start = weekStart;
  const end = addDays(weekStart, 6);
  return (
    (isSameDay(date, start) || isAfter(date, start)) &&
    (isSameDay(date, end) || isBefore(date, end))
  );
};

export const getWeekDeadline = (weekStart: Date) =>
  set(addDays(weekStart, 6), { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });

export const isPastDeadline = (weekStart: Date, now: Date = new Date()) =>
  now >= getWeekDeadline(weekStart);

export const isPastWeek = (weekStart: Date, now: Date = new Date()) =>
  now >= getWeekStart(now) && isBefore(weekStart, getCurrentWeekStart());

export const isAttentionRequired = (timesheet: TimesheetEntryDto) =>
  timesheet.status === 'attention-required';

export const getCurrentWeekStart = () => startOfWeek(new Date(), { weekStartsOn: 6 });

const TIME_24H_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const TIME_12H_PATTERN = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i;

export type Meridian = 'AM' | 'PM';

const normalizeHour12 = (hours: number) => {
  if (Number.isNaN(hours) || hours <= 0) return 12;
  if (hours > 12) return ((hours - 1) % 12) + 1;
  return hours;
};

const padTime = (hours: number, minutes: string) =>
  `${normalizeHour12(hours).toString().padStart(2, '0')}:${minutes}`;

export const splitMeridianTime = (value: string): { time: string; period: Meridian } => {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return { time: '', period: 'AM' };
  }

  const meridianMatch = TIME_12H_PATTERN.exec(trimmed);
  if (meridianMatch) {
    const [, hourStr, minuteStr, meridianRaw] = meridianMatch;
    const hours = Number(hourStr);
    const period = meridianRaw.toUpperCase() as Meridian;
    return { time: padTime(hours, minuteStr), period };
  }

  const suffixMatch = /(AM|PM)$/i.exec(trimmed);
  if (suffixMatch) {
    const period = suffixMatch[1].toUpperCase() as Meridian;
    const timePortion = trimmed.replace(/(AM|PM)$/i, '').trim();
    const twentyFourWithSuffix = TIME_24H_PATTERN.exec(timePortion);
    if (twentyFourWithSuffix) {
      const [, hourStr, minuteStr] = twentyFourWithSuffix;
      const hours24 = Number(hourStr);
      return { time: padTime(hours24, minuteStr), period };
    }
    const meridianPortion = TIME_12H_PATTERN.exec(`${timePortion} ${period}`);
    if (meridianPortion) {
      const [, hourStr, minuteStr] = meridianPortion;
      const hours = Number(hourStr);
      return { time: padTime(hours, minuteStr), period };
    }
    return { time: timePortion, period };
  }

  const twentyFourMatch = TIME_24H_PATTERN.exec(trimmed);
  if (twentyFourMatch) {
    const [, hourStr, minuteStr] = twentyFourMatch;
    const hours24 = Number(hourStr);
    const period: Meridian = hours24 >= 12 ? 'PM' : 'AM';
    return { time: padTime(hours24, minuteStr), period };
  }

  return {
    time: trimmed.replace(/(AM|PM)$/i, '').trim(),
    period: 'AM',
  };
};

export const buildMeridianTime = (time: string, period: Meridian): string => {
  const trimmed = time.trim();
  if (!trimmed) return '';
  const timeMatch = /^(\d{1,2}):([0-5]\d)$/.exec(trimmed);
  if (!timeMatch) {
    return `${trimmed} ${period}`;
  }
  const [, hourStr, minuteStr] = timeMatch;
  const hours = Number(hourStr);
  return `${padTime(hours, minuteStr)} ${period}`;
};

export const ensureMeridianTime = (value: string): string => {
  const { time, period } = splitMeridianTime(value);
  return time ? `${time} ${period}` : '';
};

export const formatIntervalValue = (value: string): string => {
  const { time, period } = splitMeridianTime(value);
  return time ? `${time} ${period}` : '';
};

export const to24HourTime = (value: string): string => {
  const { time, period } = splitMeridianTime(value);
  if (!time) return '';
  const [hourPart, minutePart] = time.split(':');
  let hours = Number(hourPart);
  if (Number.isNaN(hours) || !minutePart) return '';
  hours %= 12;
  if (period === 'PM') {
    hours += 12;
  }
  return `${hours.toString().padStart(2, '0')}:${minutePart}`;
};

export const parseTimeToMinutes = (value: string): number | null => {
  const trimmed = value.trim();
  const meridianMatch = TIME_12H_PATTERN.exec(trimmed);
  if (meridianMatch) {
    const [, hourStr, minuteStr, meridianRaw] = meridianMatch;
    let hours = Number(hourStr);
    const minutes = Number(minuteStr);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    hours %= 12;
    if (meridianRaw.toUpperCase() === 'PM') {
      hours += 12;
    }
    return hours * 60 + minutes;
  }

  if (!TIME_24H_PATTERN.test(trimmed)) return null;
  const [hours, minutes] = trimmed.split(':').map(Number);
  if (hours == null || minutes == null) return null;
  return hours * 60 + minutes;
};

type Interval = NonNullable<TimesheetEntry['intervals']>[number];

export type IntervalAnalysis =
  | { kind: 'empty' }
  | { kind: 'partial' }
  | { kind: 'invalid' }
  | { kind: 'ok'; totalMinutes: number };

export const analyzeIntervals = (intervals: Interval[] | undefined): IntervalAnalysis => {
  if (!intervals?.length) {
    return { kind: 'empty' };
  }

  let totalMinutes = 0;
  for (const interval of intervals) {
    const start = interval.start.trim();
    const end = interval.end.trim();

    if (!start && !end) {
      continue;
    }

    if (!start || !end) {
      return { kind: 'partial' };
    }

    const startMinutes = parseTimeToMinutes(start);
    const endMinutes = parseTimeToMinutes(end);

    if (
      startMinutes == null ||
      endMinutes == null ||
      endMinutes <= startMinutes ||
      Number.isNaN(startMinutes) ||
      Number.isNaN(endMinutes)
    ) {
      return { kind: 'invalid' };
    }

    totalMinutes += endMinutes - startMinutes;
  }

  if (totalMinutes === 0) {
    return { kind: 'empty' };
  }

  return { kind: 'ok', totalMinutes };
};

export const formatIntervals = (intervals: Interval[] | undefined) => {
  if (!intervals?.length) return '';
  const segments = intervals
    .filter((interval) => interval.start && interval.end)
    .map(
      (interval) => `${formatIntervalValue(interval.start)}–${formatIntervalValue(interval.end)}`,
    );
  return segments.join(', ');
};

export const formatIntervalsWithTotal = (
  intervals: Interval[] | undefined,
  totalMinutes: number,
) => {
  if (!intervals?.length) return '';
  const formatted = formatIntervals(intervals);
  if (totalMinutes <= 0) {
    return formatted;
  }
  return `${formatted} (${formatMinutes(totalMinutes)})`;
};
