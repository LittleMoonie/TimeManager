import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { dataSource } from './dataSource';
import { aggregateDay, delay } from './utils';
import type {
  KPIOverview,
  Organization,
  Role,
  Task,
  Team,
  User,
} from '@/types';
import { computeKpis } from '@/utils/kpi';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface ReportFilters {
  from: string;
  to: string;
  teamIds?: string[];
  projectIds?: string[];
  roles?: Role[];
}

export interface ReportData {
  kpis: {
    latenessRate: number;
    avgWeeklyHours: number;
    overtimeHours: number;
    absenteeismRate: number;
    onTimeArrivals: number;
    badgeCompliance: number;
  } & KPIOverview;
  hoursByTeam: Array<{ teamId: string; teamName: string; workedHours: number; expectedHours: number }>;
  latenessTrend: Array<{ date: string; lateRate: number; workedHours: number; expectedHours: number }>;
  overtimeByTeam: Array<{ teamId: string; teamName: string; overtimeHours: number }>;
  taskStatusDistribution: Array<{ status: string; value: number }>;
}

interface DayAccumulator {
  workedMinutes: number;
  expectedMinutes: number;
  lateCount: number;
  badgeDays: number;
}

const isoRange = (from: dayjs.Dayjs, to: dayjs.Dayjs) => {
  const days: dayjs.Dayjs[] = [];
  let cursor = from.startOf('day');
  const end = to.startOf('day');
  while (cursor.isBefore(end) || cursor.isSame(end)) {
    days.push(cursor);
    cursor = cursor.add(1, 'day');
  }
  return days;
};

export async function getReports(filters: ReportFilters): Promise<ReportData> {
  await delay();
  const org = dataSource.getOrganization();
  const tz = org.settings.timezone;
  const from = dayjs(filters.from).tz(tz);
  const to = dayjs(filters.to).tz(tz);

  const teams = dataSource.listTeams();
  const users = filterUsers(dataSource.listUsers(), filters);
  const userIds = new Set(users.map((u) => u.id));
  const events = dataSource
    .listClockEvents()
    .filter((event) => {
      if (!userIds.has(event.userId)) return false;
      const ts = dayjs(event.timestamp).tz(tz);
      return (ts.isSame(from) || ts.isAfter(from)) && (ts.isSame(to) || ts.isBefore(to));
    });

  const kpiOverview = computeKpis(events, org);

  const byTeam = new Map<string, DayAccumulator>();
  const byDate = new Map<string, DayAccumulator>();

  const days = isoRange(from, to);

  const teamLookup = new Map(teams.map((team) => [team.id, team] as const));
  const userTeam = (user: User) => user.teamId ?? 'unassigned';

  const expectedPerDay = (date: dayjs.Dayjs) => {
    const isWeekend = date.day() === 0 || date.day() === 6;
    return isWeekend ? 0 : org.settings.workdayHours * 60;
  };

  const ensure = (map: Map<string, DayAccumulator>, key: string): DayAccumulator => {
    if (!map.has(key)) {
      map.set(key, { workedMinutes: 0, expectedMinutes: 0, lateCount: 0, badgeDays: 0 });
    }
    return map.get(key)!;
  };

  let totalExpected = 0;
  let totalWorked = 0;
  let lateDays = 0;
  let absences = 0;
  let onTimeArrivals = 0;
  let badgeDays = 0;

  users.forEach((user) => {
    const userEvents = events.filter((event) => event.userId === user.id);
    days.forEach((day) => {
      const dateKey = day.format('YYYY-MM-DD');
      const expected = expectedPerDay(day);
      if (expected > 0) {
        totalExpected += expected;
      }
      const dayEvents = userEvents.filter((event) => dayjs(event.timestamp).tz(tz).isSame(day, 'day'));
      if (dayEvents.length === 0) {
        if (expected > 0) {
          absences += 1;
        }
        const teamKey = userTeam(user);
        const teamAcc = ensure(byTeam, teamKey);
        teamAcc.expectedMinutes += expected;

        const dateAcc = ensure(byDate, dateKey);
        dateAcc.expectedMinutes += expected;
        return;
      }

      const { workedMinutes, late } = aggregateDay(dayEvents, org);
      totalWorked += workedMinutes;
      if (late) {
        lateDays += 1;
      } else if (workedMinutes > 0) {
        onTimeArrivals += 1;
      }
      if (workedMinutes > 0) {
        badgeDays += 1;
      }

      const teamKey = userTeam(user);
      const teamAcc = ensure(byTeam, teamKey);
      teamAcc.workedMinutes += workedMinutes;
      teamAcc.expectedMinutes += expected;
      teamAcc.lateCount += late ? 1 : 0;
      teamAcc.badgeDays += workedMinutes > 0 ? 1 : 0;

      const dateAcc = ensure(byDate, dateKey);
      dateAcc.workedMinutes += workedMinutes;
      dateAcc.expectedMinutes += expected;
      dateAcc.lateCount += late ? 1 : 0;
      dateAcc.badgeDays += workedMinutes > 0 ? 1 : 0;
    });
  });

  const absenteeismRate = totalExpected === 0 ? 0 : (absences / (totalExpected / (org.settings.workdayHours * 60))) * 100;
  const avgWeeklyHours = (totalWorked / 60) / Math.max(1, days.length / 7);
  const overtimeHours = Math.max(totalWorked - totalExpected, 0) / 60;
  const badgeCompliance = totalExpected === 0 ? 0 : (badgeDays / (totalExpected / (org.settings.workdayHours * 60))) * 100;

  const hoursByTeam = Array.from(byTeam.entries()).map(([teamId, acc]) => {
    const teamName = teamId === 'unassigned' ? 'Unassigned' : teamLookup.get(teamId)?.name ?? teamId;
    return {
      teamId,
      teamName,
      workedHours: Number((acc.workedMinutes / 60).toFixed(2)),
      expectedHours: Number((acc.expectedMinutes / 60).toFixed(2)),
    };
  });

  const latenessTrend = Array.from(byDate.entries())
    .map(([date, acc]) => ({
      date,
      lateRate: acc.badgeDays === 0 ? 0 : Number(((acc.lateCount / acc.badgeDays) * 100).toFixed(1)),
      workedHours: Number((acc.workedMinutes / 60).toFixed(2)),
      expectedHours: Number((acc.expectedMinutes / 60).toFixed(2)),
    }))
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

  const overtimeByTeam = hoursByTeam.map((entry) => ({
    teamId: entry.teamId,
    teamName: entry.teamName,
    overtimeHours: Math.max(entry.workedHours - entry.expectedHours, 0),
  }));

  const tasks = filterTasks(dataSource.listTasks(), users, filters.projectIds);
  const taskStatusDistribution = buildTaskDistribution(tasks);

  return {
    kpis: {
      ...kpiOverview,
      latenessRate: Number(((lateDays / Math.max(badgeDays, 1)) * 100).toFixed(1)),
      avgWeeklyHours: Number(avgWeeklyHours.toFixed(1)),
      overtimeHours: Number(overtimeHours.toFixed(1)),
      absenteeismRate: Number(absenteeismRate.toFixed(1)),
      onTimeArrivals,
      badgeCompliance: Number(badgeCompliance.toFixed(1)),
    },
    hoursByTeam,
    latenessTrend,
    overtimeByTeam,
    taskStatusDistribution,
  };
}

const filterUsers = (users: User[], filters: ReportFilters): User[] => {
  return users.filter((user) => {
    if (filters.roles?.length && !filters.roles.includes(user.role)) {
      return false;
    }
    if (filters.teamIds?.length && (!user.teamId || !filters.teamIds.includes(user.teamId))) {
      return false;
    }
    return user.status === 'ACTIVE' || user.role !== 'USER';
  });
};

const filterTasks = (tasks: Task[], users: User[], projectIds?: string[]): Task[] => {
  const allowedUsers = new Set(users.map((user) => user.id));
  return tasks.filter((task) => {
    if (projectIds?.length && (!task.projectId || !projectIds.includes(task.projectId))) {
      return false;
    }
    if (task.assigneeId && !allowedUsers.has(task.assigneeId)) {
      return false;
    }
    return true;
  });
};

const buildTaskDistribution = (tasks: Task[]) => {
  const distribution = new Map<string, number>();
  tasks.forEach((task) => {
    distribution.set(task.status, (distribution.get(task.status) ?? 0) + 1);
  });
  return Array.from(distribution.entries()).map(([status, value]) => ({ status, value }));
};
