import type { PaginatedResponse, Task, TaskForm } from '@/types'
import { http } from './client'

// This file is out of the scope of the current task. We are only removing the mock data logic.

export const taskService = {
  getTasks: async (params?: {
    page?: number
    limit?: number
    status?: string
    assigneeId?: string
    projectId?: string
  }): Promise<PaginatedResponse<Task>> => {
    return http.getPaginated<Task>('/tasks', params)
  },

  getTask: async (id: string): Promise<Task> => {
    const response = await http.get<Task>(`/tasks/${id}`)
    return response.data
  },

  createTask: async (task: TaskForm): Promise<Task> => {
    const response = await http.post<Task>('/tasks', task)
    return response.data
  },

  updateTask: async (id: string, task: Partial<TaskForm>): Promise<Task> => {
    const response = await http.put<Task>(`/tasks/${id}`, task)
    return response.data
  },

  deleteTask: async (id: string): Promise<void> => {
    await http.delete(`/tasks/${id}`)
  },

  bulkUpdateTasks: async ({
    ids,
    updates,
  }: {
    ids: string[]
    updates: Partial<TaskForm>
  }): Promise<Task[]> => {
    const response = await http.put<Task[]>('/tasks/bulk', { ids, updates })
    return response.data
  },
}

export type TaskService = typeof taskService
