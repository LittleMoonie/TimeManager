import type { PaginatedResponse, Task, TaskForm } from '@/types';
import { http } from './client';
import { delay, mockTasks } from './mockData';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

let mockTasksState = [...mockTasks];

export const taskService = {
  getTasks: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    assigneeId?: string;
    projectId?: string;
  }): Promise<PaginatedResponse<Task>> => {
    if (USE_MOCK_DATA) {
      await delay(600);

      let filtered = [...mockTasksState];
      if (params?.status) filtered = filtered.filter((task) => task.status === params.status);
      if (params?.assigneeId) filtered = filtered.filter((task) => task.assigneeId === params.assigneeId);
      if (params?.projectId) filtered = filtered.filter((task) => task.projectId === params.projectId);

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        data: filtered.slice(start, end),
        total: filtered.length,
        page,
        limit,
      };
    }

    return http.getPaginated<Task>('/tasks', params);
  },

  getTask: async (id: string): Promise<Task> => {
    if (USE_MOCK_DATA) {
      await delay(350);
      const task = mockTasksState.find((item) => item.id === id);
      if (!task) {
        throw new Error('Task not found');
      }
      return task;
    }

    const response = await http.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: TaskForm): Promise<Task> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      const newTask: Task = {
        id: crypto.randomUUID(),
        ...task,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockTasksState.push(newTask);
      return newTask;
    }

    const response = await http.post<Task>('/tasks', task);
    return response.data;
  },

  updateTask: async (id: string, task: Partial<TaskForm>): Promise<Task> => {
    if (USE_MOCK_DATA) {
      await delay(450);
      const index = mockTasksState.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error('Task not found');
      }

      mockTasksState[index] = {
        ...mockTasksState[index],
        ...task,
        updatedAt: new Date().toISOString(),
      };
      return mockTasksState[index];
    }

    const response = await http.put<Task>(`/tasks/${id}`, task);
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      await delay(350);
      mockTasksState = mockTasksState.filter((task) => task.id !== id);
      return;
    }

    await http.delete(`/tasks/${id}`);
  },

  bulkUpdateTasks: async ({
    ids,
    updates,
  }: {
    ids: string[];
    updates: Partial<TaskForm>;
  }): Promise<Task[]> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      mockTasksState = mockTasksState.map((task) =>
        ids.includes(task.id)
          ? {
              ...task,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : task
      );
      return mockTasksState.filter((task) => ids.includes(task.id));
    }

    const response = await http.put<Task[]>('/tasks/bulk', { ids, updates });
    return response.data;
  },
};

export type TaskService = typeof taskService;
