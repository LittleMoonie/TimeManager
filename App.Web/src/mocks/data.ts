import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import type {
  AccessLog,
  ActivityItem,
  Announcement,
  AuditLog,
  ClockEvent,
  Organization,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  Team,
  TimesheetWeek,
  User,
} from '@/types';
import { computeKpis } from '@/utils/kpi';

dayjs.extend(utc);
dayjs.extend(timezone);

const now = dayjs();

const mulberry32 = (seed: number) => {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const org: Organization = {
  id: 'org_trinity',
  name: 'Trinity Industries',
  slug: 'trinity',
  ownerId: 'u_ceo',
  settings: {
    workdayHours: 8,
    latenessGraceMins: 5,
    timezone: 'Europe/Oslo',
    holidays: ['2025-12-25'],
  },
  createdAt: '2025-01-01T08:00:00Z',
  updatedAt: '2025-10-01T08:00:00Z',
};

export const teams: Team[] = [
  {
    id: 't_eng',
    organizationId: org.id,
    name: 'Engineering',
    description: 'Builds the platform',
    managerId: 'u_mgr_eng',
    memberIds: ['u_mgr_eng', 'u_u1', 'u_u2', 'u_u3', 'u_u6'],
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-10-01T08:00:00Z',
  },
  {
    id: 't_ops',
    organizationId: org.id,
    name: 'Operations',
    description: 'Keeps the lights on',
    managerId: 'u_mgr_ops',
    memberIds: ['u_mgr_ops', 'u_u4', 'u_u5', 'u_u7'],
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-10-01T08:00:00Z',
  },
  {
    id: 't_hr',
    organizationId: org.id,
    name: 'People Ops',
    description: 'Hiring and culture',
    managerId: 'u_mgr_people',
    memberIds: ['u_mgr_people', 'u_u8', 'u_u9'],
    createdAt: '2025-02-12T08:00:00Z',
    updatedAt: '2025-10-01T08:00:00Z',
  },
];

export const users: User[] = [
  {
    id: 'u_ceo',
    orgId: org.id,
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex@trinity.io',
    role: 'CEO',
    status: 'ACTIVE',
    createdAt: '2025-01-01T08:00:00Z',
    updatedAt: '2025-10-01T08:00:00Z',
  },
  {
    id: 'u_mgr_eng',
    orgId: org.id,
    teamId: 't_eng',
    firstName: 'Katrin',
    lastName: 'Ilyina',
    email: 'k.il@trinity.io',
    role: 'MANAGER',
    status: 'ACTIVE',
    createdAt: '2025-01-05T08:00:00Z',
    updatedAt: '2025-10-01T08:00:00Z',
  },
  {
    id: 'u_mgr_ops',
    orgId: org.id,
    teamId: 't_ops',
    firstName: 'Quentin',
    lastName: 'Lemaire',
    email: 'q.le@trinity.io',
    role: 'MANAGER',
    status: 'ACTIVE',
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-10-01T08:00:00Z',
  },
  {
    id: 'u_mgr_people',
    orgId: org.id,
    teamId: 't_hr',
    firstName: 'Sonia',
    lastName: 'Belotti',
    email: 's.bel@trinity.io',
    role: 'MANAGER',
    status: 'ACTIVE',
    createdAt: '2025-02-10T08:00:00Z',
    updatedAt: '2025-10-01T08:00:00Z',
  },
  {
    id: 'u_u1',
    orgId: org.id,
    teamId: 't_eng',
    firstName: 'Lena',
    lastName: 'Schmidt',
    email: 'lena.schmidt@trinity.io',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: now.subtract(2, 'day').toISOString(),
  },
  {
    id: 'u_u2',
    orgId: org.id,
    teamId: 't_eng',
    firstName: 'Mateo',
    lastName: 'Silva',
    email: 'mateo.silva@trinity.io',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2025-03-05T08:00:00Z',
    updatedAt: now.subtract(1, 'day').toISOString(),
  },
  {
    id: 'u_u3',
    orgId: org.id,
    teamId: 't_eng',
    firstName: 'Akiko',
    lastName: 'Tanaka',
    email: 'akiko.tanaka@trinity.io',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2025-03-10T08:00:00Z',
    updatedAt: now.toISOString(),
  },
  {
    id: 'u_u4',
    orgId: org.id,
    teamId: 't_ops',
    firstName: 'Noah',
    lastName: 'Dubois',
    email: 'noah.dubois@trinity.io',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2025-03-12T08:00:00Z',
    updatedAt: now.subtract(3, 'day').toISOString(),
  },
  {
    id: 'u_u5',
    orgId: org.id,
    teamId: 't_ops',
    firstName: 'Iris',
    lastName: 'Kumar',
    email: 'iris.kumar@trinity.io',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2025-03-14T08:00:00Z',
    updatedAt: now.subtract(4, 'day').toISOString(),
  },
  {
    id: 'u_u6',
    orgId: org.id,
    teamId: 't_eng',
    firstName: 'Jonas',
    lastName: 'Olsen',
    email: 'jonas.olsen@trinity.io',
    role: 'USER',
    status: 'PENDING',
    createdAt: '2025-06-01T08:00:00Z',
    updatedAt: now.subtract(10, 'day').toISOString(),
  },
  {
    id: 'u_u7',
    orgId: org.id,
    teamId: 't_ops',
    firstName: 'Emily',
    lastName: 'Stone',
    email: 'emily.stone@trinity.io',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2025-04-01T08:00:00Z',
    updatedAt: now.subtract(1, 'week').toISOString(),
  },
  {
    id: 'u_u8',
    orgId: org.id,
    teamId: 't_hr',
    firstName: 'Marius',
    lastName: 'Lund',
    email: 'marius.lund@trinity.io',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2025-04-15T08:00:00Z',
    updatedAt: now.subtract(5, 'day').toISOString(),
  },
  {
    id: 'u_u9',
    orgId: org.id,
    teamId: 't_hr',
    firstName: 'Clara',
    lastName: 'Nguyen',
    email: 'clara.nguyen@trinity.io',
    role: 'USER',
    status: 'INACTIVE',
    createdAt: '2025-05-05T08:00:00Z',
    updatedAt: now.subtract(30, 'day').toISOString(),
  },
  {
    id: 'u_u10',
    orgId: org.id,
    teamId: 't_eng',
    firstName: 'Leo',
    lastName: 'Martinez',
    email: 'leo.martinez@trinity.io',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2025-06-05T08:00:00Z',
    updatedAt: now.subtract(2, 'week').toISOString(),
  },
];

export const projects: Project[] = [
  {
    id: 'p_ncy8',
    orgId: org.id,
    name: 'NCY_8 Platform',
    description: 'Core time & KPI platform',
    status: 'ACTIVE',
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-10-01T08:00:00Z',
  },
  {
    id: 'p_gogotime',
    orgId: org.id,
    name: 'GoGoTime Rollout',
    description: 'SaaS time suite',
    status: 'ACTIVE',
    createdAt: '2025-05-01T08:00:00Z',
    updatedAt: '2025-10-01T08:00:00Z',
  },
  {
    id: 'p_onboarding',
    orgId: org.id,
    name: 'New Hire Onboarding',
    description: 'Standardise onboarding experience',
    status: 'INACTIVE',
    createdAt: '2025-04-01T08:00:00Z',
    updatedAt: '2025-08-12T08:00:00Z',
  },
];

const taskTitles = [
  'Implement mobile clock-in safeguards',
  'Update overtime calculation logic',
  'Prepare KPI briefing for leadership',
  'Draft operations SOP for late badges',
  'Refresh onboarding checklist',
  'QA NCY_8 break compliance alerts',
  'Design GoGoTime rollout playbook',
  'Document API scopes for partners',
  'Conduct security tabletop exercise',
  'Optimize database indexes',
  'Create shift handover template',
  'Calibrate badge geofences',
  'Update MUI theme tokens',
  'Revise timesheet export CSV',
  'Plan Q4 roadmap session',
];

const taskStatuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED'];
const taskPriorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const activeAssignees = users.filter((u) => u.status === 'ACTIVE' && u.role !== 'CEO');

const generateTasks = (): Task[] => {
  const list: Task[] = [];
  const random = mulberry32(1337);
  for (let i = 0; i < 30; i += 1) {
    const title = taskTitles[i % taskTitles.length];
    const assignee = activeAssignees[i % activeAssignees.length];
    const status = taskStatuses[Math.floor(random() * taskStatuses.length)];
    const priority = taskPriorities[Math.floor(random() * taskPriorities.length)];
    const project = projects[i % projects.length];
    const createdAt = dayjs('2025-07-01T09:00:00Z').add(i, 'day');
    const dueDate = createdAt.add(7 + Math.floor(random() * 7), 'day');

    list.push({
      id: `task_${i + 1}`,
      orgId: org.id,
      projectId: project.id,
      title,
      description: `${title} for ${project.name}`,
      status,
      priority,
      assigneeId: assignee.id,
      dueDate: dueDate.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.add(2, 'day').toISOString(),
    });
  }
  return list;
};

export const tasks: Task[] = generateTasks();

const timezoneAwareStart = (date: dayjs.Dayjs, hour: number, minute = 0) =>
  date.tz(org.settings.timezone).hour(hour).minute(minute).second(0).millisecond(0);

const generateClockEvents = (): ClockEvent[] => {
  const events: ClockEvent[] = [];
  const daysBack = 14;
  const startDay = dayjs().tz(org.settings.timezone).startOf('day');

  activeAssignees
    .concat(users.find((u) => u.id === 'u_ceo')!)
    .forEach((user, userIndex) => {
      const random = mulberry32(400 + userIndex);
      for (let d = 0; d < daysBack; d += 1) {
        const day = startDay.subtract(d, 'day');
        if (day.day() === 0 || day.day() === 6) {
          continue; // skip weekends
        }

        const absenceRoll = random();
        const isAbsent = absenceRoll > 0.9 || user.status !== 'ACTIVE';
        if (isAbsent) {
          continue;
        }

        const arrivalOffsetMins = Math.round((random() - 0.3) * 20); // -6 to +14 approx
        const start = timezoneAwareStart(day, 9, Math.max(0, arrivalOffsetMins));
        const isLate = start.minute() > org.settings.latenessGraceMins && start.hour() >= 9;
        const note = isLate ? 'Traffic on ring road' : undefined;

        events.push({
          id: `clk_${user.id}_${day.format('YYYYMMDD')}_in`,
          orgId: org.id,
          userId: user.id,
          type: 'IN',
          timestamp: start.toISOString(),
          note,
          geo: { lat: 59.9139, lng: 10.7522, radiusM: 150 },
        });

        const breakStart = timezoneAwareStart(day, 12, 30 + Math.floor(random() * 10));
        events.push({
          id: `clk_${user.id}_${day.format('YYYYMMDD')}_break_start`,
          orgId: org.id,
          userId: user.id,
          type: 'BREAK_START',
          timestamp: breakStart.toISOString(),
        });

        const breakEnd = breakStart.add(30 + Math.floor(random() * 10), 'minute');
        events.push({
          id: `clk_${user.id}_${day.format('YYYYMMDD')}_break_end`,
          orgId: org.id,
          userId: user.id,
          type: 'BREAK_END',
          timestamp: breakEnd.toISOString(),
        });

        const finishOffset = 17 * 60 + 45 + Math.floor(random() * 20);
        const finish = timezoneAwareStart(day, 0, 0).add(finishOffset, 'minute');
        events.push({
          id: `clk_${user.id}_${day.format('YYYYMMDD')}_out`,
          orgId: org.id,
          userId: user.id,
          type: 'OUT',
          timestamp: finish.toISOString(),
        });
      }
    });

  return events.sort((a, b) => dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf());
};

export const clockEvents: ClockEvent[] = generateClockEvents();

export const activityFeed: ActivityItem[] = clockEvents.slice(-12).map((event) => {
  const user = users.find((u) => u.id === event.userId);
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  const type = event.type === 'IN' || event.type === 'OUT' ? 'badge' : 'approval';
  const action = event.type === 'IN' ? 'clocked in' : event.type === 'OUT' ? 'clocked out' : event.type === 'BREAK_START' ? 'started break' : 'ended break';
  return {
    id: `activity_${event.id}`,
    type,
    message: `${fullName} ${action}`,
    timestamp: event.timestamp,
  } satisfies ActivityItem;
});

export const announcements: Announcement[] = [
  {
    id: 'ann_1',
    title: 'HQ badge readers maintenance',
    body: 'Readers in the East wing will be offline Friday 17:00-19:00.',
    severity: 'warning',
    createdAt: now.subtract(1, 'day').toISOString(),
  },
  {
    id: 'ann_2',
    title: 'Reminder: Submit Q4 PTO requests',
    body: 'Please submit planned holidays before November 15 to help scheduling.',
    severity: 'info',
    createdAt: now.subtract(3, 'day').toISOString(),
  },
];

export const auditLogs: AuditLog[] = Array.from({ length: 50 }).map((_, idx) => {
  const random = mulberry32(900 + idx);
  const actor = users[idx % users.length];
  const targetTables = ['users', 'teams', 'projects', 'tasks', 'clock_events'];
  const actions = ['UPDATE', 'CREATE', 'DELETE', 'APPROVE'];
  return {
    id: `audit_${idx}`,
    userId: actor?.id,
    action: actions[Math.floor(random() * actions.length)],
    targetTable: targetTables[Math.floor(random() * targetTables.length)],
    targetId: `target_${Math.floor(random() * 20)}`,
    oldValue: random() > 0.5 ? { status: 'PENDING' } : undefined,
    newValue: random() > 0.5 ? { status: 'ACTIVE' } : undefined,
    ip: `10.0.${idx % 50}.${Math.floor(random() * 200)}`,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: now.subtract(idx, 'hour').toISOString(),
  } satisfies AuditLog;
});

export const accessLogs: AccessLog[] = Array.from({ length: 60 }).map((_, idx) => {
  const random = mulberry32(700 + idx);
  const methods: AccessLog['method'][] = ['GET', 'POST', 'PUT', 'DELETE'];
  const endpoints = ['/api/v1/tasks', '/api/v1/timesheets', '/api/v1/reports', '/api/v1/teams'];
  const actor = users[idx % users.length];
  return {
    id: `access_${idx}`,
    userId: actor?.id,
    method: methods[Math.floor(random() * methods.length)],
    endpoint: endpoints[Math.floor(random() * endpoints.length)],
    statusCode: random() > 0.1 ? 200 : 500,
    latencyMs: Math.floor(50 + random() * 450),
    timestamp: now.subtract(idx, 'minute').toISOString(),
  } satisfies AccessLog;
});

export const orgKpis = computeKpis(clockEvents, org);

export const timesheetApprovals: Record<string, Record<string, TimesheetWeek>> = {};
