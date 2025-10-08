import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { dataSource } from './dataSource';
import { aggregateDay, buildWeekDays, delay, matchSearch, normalizeSearch } from './utils';
import type {
  ClockEvent,
  ClockType,
  Organization,
  TimesheetWeek,
  User,
} from '@/types';

interface ListUserParams {
  teamId?: string;
  search?: string;
}

dayjs.extend(utc);
dayjs.extend(timezone);

const isoWeekStart = (date: dayjs.Dayjs) => {
  const day = date.day();
  if (day === 0) {
    return date.subtract(6, 'day');
  }
  return date.subtract(day - 1, 'day');
};

const getOrg = (): Organization => dataSource.getOrganization();

export async function listUsers(params: ListUserParams = {}): Promise<User[]> {
  await delay();
  const searchTerm = normalizeSearch(params.search);
  return dataSource
    .listUsers()
    .filter((user) => {
      if (params.teamId && user.teamId !== params.teamId) {
        return false;
      }
      if (searchTerm) {
        return (
          matchSearch(`${user.firstName} ${user.lastName}`, searchTerm) ||
          matchSearch(user.email, searchTerm)
        );
      }
      return true;
    })
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
}

export interface TimesheetResponse extends TimesheetWeek {
  totalWorkedHours: number;
  totalPlannedHours: number;
}

const eventsForUser = (userId: string, fromISO: string, toISO: string): ClockEvent[] => {
  const org = getOrg();
  const tz = org.settings.timezone;
  const from = dayjs(fromISO).tz(tz);
  const to = dayjs(toISO).tz(tz);
  return dataSource
    .listClockEvents()
    .filter((event) => {
      if (event.userId !== userId) return false;
      const ts = dayjs(event.timestamp).tz(tz);
      return ts.isSame(from) || ts.isSame(to) || (ts.isAfter(from) && ts.isBefore(to));
    });
};

export async function getUserTimesheet(
  userId: string,
  fromISO: string,
  toISO: string,
): Promise<TimesheetResponse> {
  await delay();
  const org = getOrg();
  const tz = org.settings.timezone;
  const from = dayjs(fromISO).tz(tz);
  const weekStart = isoWeekStart(from);
  const days = buildWeekDays(weekStart, org);
  const to = dayjs(toISO).tz(tz);
  const events = eventsForUser(userId, weekStart.toISOString(), to.toISOString());

  days.forEach((day) => {
    const date = dayjs(day.date).tz(tz);
    const sameDayEvents = events.filter((event) => dayjs(event.timestamp).tz(tz).isSame(date, 'day'));
    if (sameDayEvents.length) {
      const { workedMinutes, late } = aggregateDay(sameDayEvents, org);
      day.workedHours = Number((workedMinutes / 60).toFixed(2));
      day.late = late;
      day.absent = workedMinutes === 0 && day.plannedHours > 0;
    }
  });

  const totalWorked = days.reduce((sum, day) => sum + day.workedHours, 0);
  const totalPlanned = days.reduce((sum, day) => sum + day.plannedHours, 0);
  const approvals = dataSource.listTimesheetWeeks(userId);
  const weekKey = weekStart.format('YYYY-[W]WW');
  const approval = approvals[weekKey];

  return {
    weekOf: weekKey,
    days,
    approved: approval?.approved ?? false,
    approverId: approval?.approverId,
    approverNote: approval?.approverNote,
    totalWorkedHours: Number(totalWorked.toFixed(2)),
    totalPlannedHours: Number(totalPlanned.toFixed(2)),
  };
}

export async function approveTimesheet(
  userId: string,
  weekISO: string,
  approve: boolean,
  note?: string,
  approverId?: string,
): Promise<TimesheetWeek> {
  await delay();
  const existing = dataSource.listTimesheetWeeks(userId)[weekISO] ?? {
    weekOf: weekISO,
    days: [],
  };
  const week: TimesheetWeek = {
    ...existing,
    weekOf: weekISO,
    approved: approve,
    approverNote: note,
    approverId,
  };
  dataSource.upsertTimesheetWeek(userId, week);
  return week;
}

type SessionState = 'IDLE' | 'WORKING' | 'ON_BREAK';

const resolveSessionState = (events: ClockEvent[]): SessionState => {
  const sorted = [...events].sort((a, b) => dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf());
  let state: SessionState = 'IDLE';
  sorted.forEach((event) => {
    switch (event.type) {
      case 'IN':
        state = 'WORKING';
        break;
      case 'BREAK_START':
        if (state === 'WORKING') {
          state = 'ON_BREAK';
        }
        break;
      case 'BREAK_END':
        if (state === 'ON_BREAK') {
          state = 'WORKING';
        }
        break;
      case 'OUT':
        state = 'IDLE';
        break;
      default:
        break;
    }
  });
  return state;
};

interface BadgeOptions {
  force?: boolean;
}

export async function badge(
  userId: string,
  type: ClockType,
  note?: string,
  options: BadgeOptions = {},
): Promise<ClockEvent> {
  await delay(80);
  const org = getOrg();
  const tz = org.settings.timezone;
  const events = dataSource
    .listClockEvents()
    .filter((event) => event.userId === userId)
    .sort((a, b) => dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf());
  const state = resolveSessionState(events);
  const lastEvent = events.at(-1);
  const lastTimestamp = lastEvent ? dayjs(lastEvent.timestamp) : null;

  if (type === 'IN' && state !== 'IDLE') {
    throw new Error('Already clocked in');
  }
  if (type === 'OUT' && state !== 'WORKING') {
    throw new Error(state === 'ON_BREAK' ? 'End break before clocking out' : 'No active session');
  }
  if (type === 'BREAK_START' && state !== 'WORKING') {
    throw new Error('Cannot start break while not working');
  }
  if (type === 'BREAK_END' && state !== 'ON_BREAK') {
    throw new Error('No active break to end');
  }

  if (!options.force && lastTimestamp) {
    const secondsSinceLastPunch = dayjs().diff(lastTimestamp, 'second');
    if (secondsSinceLastPunch < 60) {
      const err = new Error('confirm');
      err.name = 'BadgeConfirmError';
      throw err;
    }
  }

  const timestamp = dayjs().tz(tz).toISOString();
  const event: ClockEvent = {
    id: `clk_${userId}_${Date.now()}_${type.toLowerCase()}`,
    userId,
    orgId: org.id,
    type,
    timestamp,
    note,
    geo: type === 'IN' ? { lat: 59.9139, lng: 10.7522, radiusM: 150 } : undefined,
  };

  dataSource.addClockEvent(event);
  return event;
}
