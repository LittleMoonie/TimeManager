import dayjs from 'dayjs';

import { dataSource } from './dataSource';
import { delay, matchSearch, normalizeSearch } from './utils';
import type { Project, Task } from '@/types';

interface ListProjectsParams {
  search?: string;
  status?: Project['status'][];
}

export interface ProjectWithStats extends Project {
  activeTasks: number;
  completedTasks: number;
  progress: number;
}

export async function listProjects(params: ListProjectsParams = {}): Promise<ProjectWithStats[]> {
  await delay();
  const search = normalizeSearch(params.search);
  const tasks = dataSource.listTasks();
  return dataSource
    .listProjects()
    .filter((project) => {
      if (params.status?.length && !params.status.includes(project.status)) {
        return false;
      }
      if (search) {
        return matchSearch(`${project.name} ${project.description ?? ''}`, search);
      }
      return true;
    })
    .map((project) => enrichWithStats(project, tasks))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const enrichWithStats = (project: Project, tasks: Task[]): ProjectWithStats => {
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const active = projectTasks.filter((task) => task.status !== 'DONE' && task.status !== 'CANCELLED');
  const completed = projectTasks.filter((task) => task.status === 'DONE');
  const progress = projectTasks.length
    ? Math.round((completed.length / projectTasks.length) * 100)
    : project.status === 'ACTIVE'
      ? 25
      : 100;

  return {
    ...project,
    activeTasks: active.length,
    completedTasks: completed.length,
    progress,
  };
};

export async function getProject(projectId: string): Promise<ProjectWithStats | undefined> {
  await delay();
  const project = dataSource.listProjects().find((p) => p.id === projectId);
  if (!project) return undefined;
  const tasks = dataSource.listTasks();
  return enrichWithStats(project, tasks);
}

export async function updateProject(
  projectId: string,
  patch: Partial<Project>,
): Promise<Project | undefined> {
  await delay();
  return dataSource.updateProject(projectId, { ...patch, updatedAt: dayjs().toISOString() });
}
