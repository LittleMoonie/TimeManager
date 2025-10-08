import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/lib/api/tasks';
import type { TaskForm } from '@/types';

export const useTasks = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  assigneeId?: string;
  projectId?: string;
}) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskService.getTasks(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskService.getTask(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, task }: { id: string; task: Partial<TaskForm> }) =>
      taskService.updateTask(id, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Partial<TaskForm> }) =>
      taskService.bulkUpdateTasks({ ids, updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
