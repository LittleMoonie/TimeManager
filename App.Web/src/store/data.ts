import { create } from 'zustand';

import { badge as badgeApi, getUserTimesheet, listUsers } from '@/api/userApi';
import { listTeams } from '@/api/teamApi';
import { listProjects, type ProjectWithStats } from '@/api/projectApi';
import { createTask, deleteTask, listTasks, updateTask } from '@/api/taskApi';
import { listActivityFeed, listAnnouncements } from '@/api/engagementApi';
import { dataSource } from '@/api/dataSource';
import type {
  ActivityItem,
  Announcement,
  ClockEvent,
  Task,
  Team,
  TimesheetResponse,
  User,
} from '@/types';

interface DataState {
  initialized: boolean;
  loading: boolean;
  users: User[];
  teams: Team[];
  projects: ProjectWithStats[];
  tasks: Task[];
  announcements: Announcement[];
  activity: ActivityItem[];
  clockEvents: ClockEvent[];
  loadInitialData: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  addTask: (input: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string, patch: Partial<Task>) => Promise<Task | undefined>;
  removeTask: (taskId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshTeams: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  badge: (
    userId: string,
    type: ClockEvent['type'],
    note?: string,
    options?: { force?: boolean },
  ) => Promise<ClockEvent>;
  fetchTimesheet: (userId: string, fromISO: string, toISO: string) => Promise<TimesheetResponse>;
}

export const useDataStore = create<DataState>((set, get) => ({
  initialized: false,
  loading: false,
  users: [],
  teams: [],
  projects: [],
  tasks: [],
  announcements: [],
  activity: [],
  clockEvents: [],
  loadInitialData: async () => {
    set({ loading: true });
    const [users, teams, projects, tasks, announcements, activity, clockEvents] = await Promise.all([
      listUsers(),
      listTeams(),
      listProjects(),
      listTasks(),
      listAnnouncements(),
      listActivityFeed(),
      Promise.resolve(dataSource.listClockEvents()),
    ]);
    set({
      users,
      teams,
      projects,
      tasks,
      announcements,
      activity,
      clockEvents,
      loading: false,
      initialized: true,
    });
  },
  refreshTasks: async () => {
    const tasks = await listTasks();
    set({ tasks });
  },
  addTask: async (input) => {
    const task = await createTask(input);
    await get().refreshTasks();
    return task;
  },
  updateTask: async (taskId, patch) => {
    const task = await updateTask(taskId, patch);
    await get().refreshTasks();
    return task;
  },
  removeTask: async (taskId) => {
    await deleteTask(taskId);
    await get().refreshTasks();
  },
  refreshUsers: async () => {
    const users = await listUsers();
    set({ users });
  },
  refreshTeams: async () => {
    const teams = await listTeams();
    set({ teams });
  },
  refreshProjects: async () => {
    const projects = await listProjects();
    set({ projects });
  },
  badge: async (userId, type, note, options) => {
    const event = await badgeApi(userId, type, note, options);
    set((state) => ({ clockEvents: [...state.clockEvents, event] }));
    return event;
  },
  fetchTimesheet: async (userId, fromISO, toISO) => {
    return getUserTimesheet(userId, fromISO, toISO);
  },
}));
