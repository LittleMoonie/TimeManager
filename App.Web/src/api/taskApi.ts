import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';

import { dataSource } from './dataSource';
import { delay, matchSearch, normalizeSearch } from './utils';
import type { Task, TaskPriority, TaskStatus } from '@/types';

interface ListTasksParams {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeIds?: string[];
  projectIds?: string[];
  search?: string;
}

export async function listTasks(params: ListTasksParams = {}): Promise<Task[]> {
  await delay();
  const search = normalizeSearch(params.search);

  return dataSource
    .listTasks()
    .filter((task) => {
      if (params.status?.length && !params.status.includes(task.status)) {
        return false;
      }
      if (params.priority?.length && !params.priority.includes(task.priority)) {
        return false;
      }
      if (params.assigneeIds?.length && (!task.assigneeId || !params.assigneeIds.includes(task.assigneeId))) {
        return false;
      }
      if (params.projectIds?.length && (!task.projectId || !params.projectIds.includes(task.projectId))) {
        return false;
      }
      if (search) {
        return matchSearch(`${task.title} ${task.description ?? ''}`, search);
      }
      return true;
    })
    .sort((a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf());
}

export async function createTask(input: Partial<Task>): Promise<Task> {
  await delay();
  const now = dayjs().toISOString();
  const task: Task = {
    id: input.id ?? uuid(),
    orgId: input.orgId ?? dataSource.getOrganization().id,
    projectId: input.projectId,
    title: input.title ?? 'Untitled task',
    description: input.description,
    status: input.status ?? 'TODO',
    priority: input.priority ?? 'MEDIUM',
    assigneeId: input.assigneeId,
    dueDate: input.dueDate ?? dayjs().add(5, 'day').toISOString(),
    createdAt: now,
    updatedAt: now,
  };
  return dataSource.upsertTask(task);
}

export async function updateTask(taskId: string, patch: Partial<Task>): Promise<Task | undefined> {
  await delay();
  const existing = dataSource
    .listTasks()
    .find((task) => task.id === taskId);
  if (!existing) {
    return undefined;
  }
  const next: Task = {
    ...existing,
    ...patch,
    updatedAt: dayjs().toISOString(),
  };
  dataSource.upsertTask(next);
  return next;
}

export async function bulkUpdateTasks(taskIds: string[], patch: Partial<Task>): Promise<Task[]> {
  await delay();
  const updated: Task[] = [];
  for (const taskId of taskIds) {
    const task = await updateTask(taskId, patch);
    if (task) {
      updated.push(task);
    }
  }
  return updated;
}

export async function deleteTask(taskId: string): Promise<void> {
  await delay();
  dataSource.removeTask(taskId);
}
