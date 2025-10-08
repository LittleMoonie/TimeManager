import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';

import {
  accessLogs as accessLogsSeed,
  activityFeed as activitySeed,
  announcements as announcementsSeed,
  auditLogs as auditLogsSeed,
  clockEvents as clockEventSeed,
  org,
  projects as projectsSeed,
  tasks as tasksSeed,
  teams as teamsSeed,
  timesheetApprovals as timesheetApprovalsSeed,
  users as usersSeed,
} from '@/mocks/data';
import type {
  AccessLog,
  ActivityItem,
  Announcement,
  AuditLog,
  ClockEvent,
  Organization,
  Project,
  Task,
  Team,
  TimesheetWeek,
  User,
} from '@/types';

const clone = <T>(value: T): T => structuredClone(value);

type DbState = {
  org: Organization;
  users: User[];
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  clockEvents: ClockEvent[];
  announcements: Announcement[];
  activity: ActivityItem[];
  auditLogs: AuditLog[];
  accessLogs: AccessLog[];
  timesheetApprovals: Record<string, Record<string, TimesheetWeek>>;
  apiKeys: Array<{
    id: string;
    name: string;
    createdAt: string;
    lastUsedAt?: string;
    scopes: string[];
    active: boolean;
  }>;
  webhooks: Array<{
    id: string;
    name: string;
    url: string;
    enabled: boolean;
    createdAt: string;
  }>;
};

const db: DbState = {
  org,
  users: [...usersSeed],
  teams: [...teamsSeed],
  projects: [...projectsSeed],
  tasks: [...tasksSeed],
  clockEvents: [...clockEventSeed],
  announcements: [...announcementsSeed],
  activity: [...activitySeed],
  auditLogs: [...auditLogsSeed],
  accessLogs: [...accessLogsSeed],
  timesheetApprovals: { ...timesheetApprovalsSeed },
  apiKeys: [
    {
      id: 'key_live_123',
      name: 'Operations dashboard',
      createdAt: '2025-07-10T09:00:00Z',
      lastUsedAt: dayjs().subtract(2, 'day').toISOString(),
      scopes: ['reports.read', 'timesheets.read'],
      active: true,
    },
    {
      id: 'key_stage_789',
      name: 'QA integration',
      createdAt: '2025-05-14T09:00:00Z',
      lastUsedAt: dayjs().subtract(12, 'day').toISOString(),
      scopes: ['tasks.write'],
      active: false,
    },
  ],
  webhooks: [
    {
      id: 'wh_1',
      name: 'Slack lateness alerts',
      url: 'https://hooks.slack.com/services/demo',
      enabled: true,
      createdAt: '2025-06-01T08:00:00Z',
    },
    {
      id: 'wh_2',
      name: 'Data warehouse sync',
      url: 'https://example.com/webhooks/warehouse',
      enabled: false,
      createdAt: '2025-07-12T08:00:00Z',
    },
  ],
};

export const dataSource = {
  getOrganization(): Organization {
    return clone(db.org);
  },
  updateOrganization(partial: Partial<Organization>): Organization {
    db.org = { ...db.org, ...partial };
    return clone(db.org);
  },
  updateOrgSettings(settings: Partial<Organization['settings']>): Organization {
    db.org = { ...db.org, settings: { ...db.org.settings, ...settings } };
    return clone(db.org);
  },
  listUsers(): User[] {
    return db.users.map((user) => ({ ...user }));
  },
  updateUser(userId: string, patch: Partial<User>): User | undefined {
    const idx = db.users.findIndex((user) => user.id === userId);
    if (idx === -1) return undefined;
    db.users[idx] = { ...db.users[idx], ...patch, updatedAt: dayjs().toISOString() };
    return { ...db.users[idx] };
  },
  listTeams(): Team[] {
    return db.teams.map((team) => ({ ...team, memberIds: [...team.memberIds] }));
  },
  updateTeam(teamId: string, patch: Partial<Team>): Team | undefined {
    const idx = db.teams.findIndex((team) => team.id === teamId);
    if (idx === -1) return undefined;
    db.teams[idx] = {
      ...db.teams[idx],
      ...patch,
      memberIds: patch.memberIds ? [...patch.memberIds] : [...db.teams[idx].memberIds],
      updatedAt: dayjs().toISOString(),
    };
    return { ...db.teams[idx], memberIds: [...db.teams[idx].memberIds] };
  },
  listProjects(): Project[] {
    return db.projects.map((project) => ({ ...project }));
  },
  updateProject(projectId: string, patch: Partial<Project>): Project | undefined {
    const idx = db.projects.findIndex((project) => project.id === projectId);
    if (idx === -1) return undefined;
    db.projects[idx] = { ...db.projects[idx], ...patch, updatedAt: dayjs().toISOString() };
    return { ...db.projects[idx] };
  },
  listTasks(): Task[] {
    return db.tasks.map((task) => ({ ...task }));
  },
  upsertTask(task: Task): Task {
    const idx = db.tasks.findIndex((t) => t.id === task.id);
    if (idx === -1) {
      db.tasks.push(task);
    } else {
      db.tasks[idx] = { ...task, updatedAt: dayjs().toISOString() };
    }
    return { ...task };
  },
  removeTask(taskId: string) {
    const idx = db.tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      db.tasks.splice(idx, 1);
    }
  },
  listClockEvents(): ClockEvent[] {
    return db.clockEvents.map((event) => ({ ...event }));
  },
  addClockEvent(event: ClockEvent) {
    db.clockEvents.push(event);
    db.activity.unshift({
      id: `activity_${event.id}`,
      type: event.type === 'IN' || event.type === 'OUT' ? 'badge' : 'approval',
      message: `${event.userId} ${event.type.toLowerCase()}`,
      timestamp: event.timestamp,
    });
  },
  listAnnouncements(): Announcement[] {
    return db.announcements.map((ann) => ({ ...ann }));
  },
  listActivity(): ActivityItem[] {
    return db.activity.slice(0, 50).map((item) => ({ ...item }));
  },
  listAuditLogs(): AuditLog[] {
    return db.auditLogs.map((log) => ({ ...log }));
  },
  listAccessLogs(): AccessLog[] {
    return db.accessLogs.map((log) => ({ ...log }));
  },
  listTimesheetWeeks(userId: string): Record<string, TimesheetWeek> {
    if (!db.timesheetApprovals[userId]) {
      db.timesheetApprovals[userId] = {};
    }
    return clone(db.timesheetApprovals[userId]);
  },
  upsertTimesheetWeek(userId: string, week: TimesheetWeek) {
    if (!db.timesheetApprovals[userId]) {
      db.timesheetApprovals[userId] = {};
    }
    db.timesheetApprovals[userId][week.weekOf] = clone(week);
  },
  createApiKey(name: string) {
    const key = {
      id: uuid(),
      name,
      createdAt: dayjs().toISOString(),
      lastUsedAt: undefined,
      scopes: ['reports.read'],
      active: true,
    };
    db.apiKeys.unshift(key);
    return { ...key };
  },
  listApiKeys() {
    return db.apiKeys.map((key) => ({ ...key }));
  },
  revokeApiKey(id: string) {
    const idx = db.apiKeys.findIndex((key) => key.id === id);
    if (idx !== -1) {
      db.apiKeys[idx] = { ...db.apiKeys[idx], active: false };
      return { ...db.apiKeys[idx] };
    }
    return undefined;
  },
  listWebhooks() {
    return db.webhooks.map((webhook) => ({ ...webhook }));
  },
  toggleWebhook(id: string, enabled: boolean) {
    const idx = db.webhooks.findIndex((wh) => wh.id === id);
    if (idx !== -1) {
      db.webhooks[idx] = { ...db.webhooks[idx], enabled };
      return { ...db.webhooks[idx] };
    }
    return undefined;
  },
};
