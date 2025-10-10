// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// export const useTasks = (params?: {
//   page?: number
//   limit?: number
//   status?: string
//   assigneeId?: string
//   projectId?: string
// }) => {
//   return useQuery({
//     queryKey: ['tasks', params],
//     queryFn: () => TasksService.getTasks(params),
//     staleTime: 30 * 1000, // 30 seconds
//   })
// }

// export const useTask = (id: string) => {
//   return useQuery({
//     queryKey: ['tasks', id],
//     queryFn: () => TasksService.getTask(id),
//     enabled: !!id,
//   })
// }

// export const useCreateTask = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: TasksService.createTask,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['tasks'] })
//     },
//   })
// }

// export const useUpdateTask = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: ({ id, task }: { id: string; task: Partial<TaskForm> }) =>
//       TasksService.updateTask(id, task),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['tasks'] })
//     },
//   })
// }

// export const useDeleteTask = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: TasksService.deleteTask,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['tasks'] })
//     },
//   })
// }

// export const useBulkUpdateTasks = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: ({ ids, updates }: { ids: string[]; updates: Partial<TaskForm> }) =>
//       TasksService.bulkUpdateTasks({ ids, updates }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['tasks'] })
//     },
//   })
// }
