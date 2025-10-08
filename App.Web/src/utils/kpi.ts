import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import type { ClockEvent, KPIOverview, Organization } from '@/types';

dayjs.extend(utc);
dayjs.extend(timezone);

interface DailyAccumulator {
  date: string;
  workedMinutes: number;
  expectedMinutes: number;
  isOnTime: boolean;
  lateMinutes: number;
  hasEvents: boolean;
}

interface SessionState {
  firstIn?: dayjs.Dayjs;
  currentIn?: dayjs.Dayjs;
  breakStart?: dayjs.Dayjs | null;
  accumulatedBreak: number;
}

const ensureAccumulator = (
  map: Map<string, DailyAccumulator>,
  key: string,
  date: string,
  expectedMinutes: number,
): DailyAccumulator => {
  if (!map.has(key)) {
    map.set(key, {
      date,
      workedMinutes: 0,
      expectedMinutes,
      isOnTime: true,
      lateMinutes: 0,
      hasEvents: false,
    });
  }
  return map.get(key)!;
};

const ensureSession = (map: Map<string, SessionState>, key: string): SessionState => {
  if (!map.has(key)) {
    map.set(key, { accumulatedBreak: 0 });
  }
  return map.get(key)!;
};

const isWeekend = (timestamp: dayjs.Dayjs) => {
  const day = timestamp.day();
  return day === 0 || day === 6;
};

export function computeKpis(events: ClockEvent[], org: Organization): KPIOverview {
  const tz = org.settings.timezone;
  const expectedPerDay = org.settings.workdayHours * 60;
  const byUserDay = new Map<string, DailyAccumulator>();
  const sessions = new Map<string, SessionState>();

  const sorted = [...events].sort((a, b) => dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf());

  sorted.forEach((event) => {
    const ts = dayjs(event.timestamp).tz(tz);
    const dateKey = ts.format('YYYY-MM-DD');
    const accumulatorKey = `${event.userId}_${dateKey}`;
    const accumulator = ensureAccumulator(byUserDay, accumulatorKey, dateKey, expectedPerDay);
    const session = ensureSession(sessions, accumulatorKey);
    accumulator.hasEvents = true;

    switch (event.type) {
      case 'IN': {
        if (!session.firstIn) {
          session.firstIn = ts;
          const startOfDay = ts.hour(9).minute(0).second(0).millisecond(0);
          const grace = startOfDay.add(org.settings.latenessGraceMins, 'minute');
          if (ts.isAfter(grace)) {
            accumulator.isOnTime = false;
            accumulator.lateMinutes += ts.diff(grace, 'minute');
          }
        }
        if (!session.currentIn) {
          session.currentIn = ts;
          session.breakStart = null;
        }
        break;
      }
      case 'BREAK_START': {
        if (session.currentIn && !session.breakStart) {
          session.breakStart = ts;
        }
        break;
      }
      case 'BREAK_END': {
        if (session.currentIn && session.breakStart) {
          const duration = ts.diff(session.breakStart, 'minute');
          session.accumulatedBreak += Math.max(duration, 0);
          session.breakStart = null;
        }
        break;
      }
      case 'OUT': {
        if (session.currentIn) {
          const gross = ts.diff(session.currentIn, 'minute');
          const net = Math.max(gross - session.accumulatedBreak, 0);
          accumulator.workedMinutes += net;
          session.currentIn = undefined;
          session.accumulatedBreak = 0;
        }
        break;
      }
      default:
        break;
    }
  });

  let totalWorked = 0;
  let onTimeDays = 0;
  let lateCount = 0;
  let absenceCount = 0;
  let overtimeMinutes = 0;
  let countedDays = 0;

  byUserDay.forEach((acc) => {
    if (!acc.hasEvents) {
      absenceCount += 1;
      return;
    }
    if (acc.workedMinutes === 0) {
      absenceCount += 1;
      return;
    }
    countedDays += 1;
    totalWorked += acc.workedMinutes;
    if (acc.isOnTime) {
      onTimeDays += 1;
    } else {
      lateCount += 1;
    }
    const overtime = acc.workedMinutes - acc.expectedMinutes;
    if (overtime > 0) {
      overtimeMinutes += overtime;
    }
  });

  const onTimeRate = countedDays === 0 ? 0 : (onTimeDays / countedDays) * 100;
  const avgHoursPerDay = countedDays === 0 ? 0 : totalWorked / countedDays / 60;

  return {
    onTimeRate: Number(onTimeRate.toFixed(1)),
    avgHoursPerDay: Number(avgHoursPerDay.toFixed(2)),
    lateCount,
    absences: absenceCount,
    overtimeHours: Number((overtimeMinutes / 60).toFixed(1)),
  };
}

export function groupEventsByDate(events: ClockEvent[], org: Organization) {
  const tz = org.settings.timezone;
  const grouped = new Map<string, ClockEvent[]>();
  events.forEach((event) => {
    const key = dayjs(event.timestamp).tz(tz).format('YYYY-MM-DD');
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(event);
  });
  return grouped;
}

export interface DailySummary {
  date: string;
  workedMinutes: number;
  expectedMinutes: number;
  lateCount: number;
  sessions: number;
}

export function summarizeEventsByDay(events: ClockEvent[], org: Organization): DailySummary[] {
  const tz = org.settings.timezone;
  const perUserDay = new Map<string, {
    date: string;
    workedMinutes: number;
    expectedMinutes: number;
    late: boolean;
    sessions: number;
  }>();
  const sessions = new Map<string, SessionState>();

  const sorted = [...events].sort((a, b) => dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf());

  const ensureUserAccumulator = (userId: string, ts: dayjs.Dayjs) => {
    const dateKey = ts.format('YYYY-MM-DD');
    const key = `${userId}_${dateKey}`;
    if (!perUserDay.has(key)) {
      const expectedMinutes = isWeekend(ts) ? 0 : org.settings.workdayHours * 60;
      perUserDay.set(key, {
        date: dateKey,
        workedMinutes: 0,
        expectedMinutes,
        late: false,
        sessions: 0,
      });
    }
    if (!sessions.has(key)) {
      sessions.set(key, { accumulatedBreak: 0 });
    }
    return { acc: perUserDay.get(key)!, state: sessions.get(key)! };
  };

  sorted.forEach((event) => {
    const ts = dayjs(event.timestamp).tz(tz);
    const { acc, state } = ensureUserAccumulator(event.userId, ts);

    switch (event.type) {
      case 'IN': {
        acc.sessions += 1;
        if (!state.firstIn) {
          state.firstIn = ts;
          const startOfDay = ts.hour(9).minute(0).second(0).millisecond(0);
          const grace = startOfDay.add(org.settings.latenessGraceMins, 'minute');
          if (ts.isAfter(grace)) {
            acc.late = true;
          }
        }
        if (!state.currentIn) {
          state.currentIn = ts;
          state.breakStart = null;
        }
        break;
      }
      case 'BREAK_START': {
        if (state.currentIn && !state.breakStart) {
          state.breakStart = ts;
        }
        break;
      }
      case 'BREAK_END': {
        if (state.currentIn && state.breakStart) {
          const duration = ts.diff(state.breakStart, 'minute');
          state.accumulatedBreak += Math.max(duration, 0);
          state.breakStart = null;
        }
        break;
      }
      case 'OUT': {
        if (state.currentIn) {
          const gross = ts.diff(state.currentIn, 'minute');
          const net = Math.max(gross - state.accumulatedBreak, 0);
          acc.workedMinutes += net;
          state.currentIn = undefined;
          state.accumulatedBreak = 0;
        }
        break;
      }
      default:
        break;
    }
  });

  const perDay = new Map<string, DailySummary>();
  perUserDay.forEach((acc) => {
    const { date } = acc;
    if (!perDay.has(date)) {
      perDay.set(date, {
        date,
        workedMinutes: 0,
        expectedMinutes: 0,
        lateCount: 0,
        sessions: 0,
      });
    }
    const summary = perDay.get(date)!;
    summary.workedMinutes += acc.workedMinutes;
    summary.expectedMinutes += acc.expectedMinutes;
    summary.lateCount += acc.late ? 1 : 0;
    summary.sessions += acc.sessions;
  });

  return Array.from(perDay.values()).sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
}
