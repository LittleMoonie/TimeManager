// import { useState } from 'react'
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   IconButton,
//   InputLabel,
//   MenuItem,
//   Select,
//   TextField,
//   Grid,
//   type SelectChangeEvent,
// } from '@mui/material'
// import { DataGrid, type GridColDef } from '@mui/x-data-grid'
// import { Add, Delete, Edit } from '@mui/icons-material'
// import { ErrorMessage } from '@/components/ui/ErrorMessage'
// import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
// import { PageHeader } from '@/components/ui/PageHeader'
// import { AppBreadcrumbs } from '@/components/ui/Breadcrumbs'
// import { useCreateTask, useDeleteTask, useTasks } from '@/hooks/useTasks'

// const statusChips: Record<TaskStatus, 'default' | 'success' | 'warning' | 'info' | 'error'> = {
//   TODO: 'default',
//   IN_PROGRESS: 'warning',
//   REVIEW: 'info',
//   DONE: 'success',
//   CANCELLED: 'error',
// }

// const priorityChips: Record<TaskPriority, 'default' | 'success' | 'warning' | 'error'> = {
//   LOW: 'success',
//   MEDIUM: 'warning',
//   HIGH: 'error',
//   URGENT: 'error',
// }

// type TaskFilters = {
//   status: string
//   priority: string
//   search: string
// }

// const defaultTask = {
//   title: '',
//   description: '',
//   status: 'TODO' as TaskStatus,
//   priority: 'MEDIUM' as TaskPriority,
// }

// const TasksPage = () => {
//   const [filters, setFilters] = useState<TaskFilters>({
//     status: '',
//     priority: '',
//     search: '',
//   })
//   const [createDialogOpen, setCreateDialogOpen] = useState(false)
//   const [newTask, setNewTask] = useState(defaultTask)

//   const { data, isLoading, error } = useTasks()
//   const createTask = useCreateTask()
//   const deleteTask = useDeleteTask()

//   if (isLoading) {
//     return <LoadingSpinner message="Loading tasks..." />
//   }

//   if (error) {
//     return <ErrorMessage message="Failed to load tasks" />
//   }

//   const tasks = data?.data ?? []

//   const filteredTasks = tasks.filter((task: Task) => {
//     if (filters.status && task.status !== filters.status) return false
//     if (filters.priority && task.priority !== filters.priority) return false
//     if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()))
//       return false
//     return true
//   })

//   const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const { value } = event.target
//     setFilters(prev => ({ ...prev, search: value }))
//   }

//   const handleSelectFilterChange = (key: 'status' | 'priority') => (event: SelectChangeEvent) => {
//     const { value } = event.target
//     setFilters(prev => ({ ...prev, [key]: value }))
//   }

//   const handleCreateTask = async () => {
//     try {
//       await createTask.mutateAsync(newTask as Task)
//       setNewTask(defaultTask)
//       setCreateDialogOpen(false)
//     } catch (mutationError) {
//       console.error('Failed to create task', mutationError)
//     }
//   }

//   const handleEditTask = (task: Task) => {
//     console.info('Edit task', task)
//   }

//   const handleDeleteTask = async (taskId: string) => {
//     const confirmed = window.confirm('Are you sure you want to delete this task?')
//     if (!confirmed) return

//     try {
//       await deleteTask.mutateAsync(taskId as Task['id'])
//     } catch (mutationError) {
//       console.error('Failed to delete task', mutationError)
//     }
//   }

//   const columns: GridColDef<Task>[] = [
//     { field: 'title', headerName: 'Title', flex: 2, editable: true },
//     {
//       field: 'status',
//       headerName: 'Status',
//       flex: 1,
//       renderCell: ({ row }) => (
//         <Chip label={row.status} color={statusChips[row.status]} size="small" />
//       ),
//     },
//     {
//       field: 'priority',
//       headerName: 'Priority',
//       flex: 1,
//       renderCell: ({ row }) => (
//         <Chip label={row.priority} color={priorityChips[row.priority]} size="small" />
//       ),
//     },
//     {
//       field: 'createdAt',
//       headerName: 'Created',
//       flex: 1,
//       valueFormatter: ({ value }) => new Date(value as string).toLocaleDateString(),
//     },
//     {
//       field: 'actions',
//       headerName: 'Actions',
//       flex: 1,
//       sortable: false,
//       renderCell: params => (
//         <Box display="flex" gap={1}>
//           <IconButton size="small" onClick={() => handleEditTask(params.row)}>
//             <Edit fontSize="small" />
//           </IconButton>
//           <IconButton size="small" color="error" onClick={() => handleDeleteTask(params.row.id)}>
//             <Delete fontSize="small" />
//           </IconButton>
//         </Box>
//       ),
//     },
//   ]

//   return (
//     <Box display="flex" flexDirection="column" gap={3}>
//       <AppBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Tasks' }]} />

//       <PageHeader
//         title="Tasks"
//         subtitle="Manage your work, track progress, and collaborate with your team."
//         actions={
//           <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
//             Create Task
//           </Button>
//         }
//       />

//       <Card>
//         <CardContent>
//           <Grid container spacing={2} alignItems="center">
//             <Grid size={{ xs: 12, md: 4 }}>
//               <TextField
//                 fullWidth
//                 label="Search tasks"
//                 value={filters.search}
//                 onChange={handleSearchChange}
//               />
//             </Grid>
//             <Grid size={{ xs: 12, md: 4 }}>
//               <FormControl fullWidth>
//                 <InputLabel>Status</InputLabel>
//                 <Select
//                   label="Status"
//                   value={filters.status}
//                   onChange={handleSelectFilterChange('status')}
//                 >
//                   <MenuItem value="">All</MenuItem>
//                   <MenuItem value="TODO">To Do</MenuItem>
//                   <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
//                   <MenuItem value="REVIEW">Review</MenuItem>
//                   <MenuItem value="DONE">Done</MenuItem>
//                   <MenuItem value="CANCELLED">Cancelled</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid size={{ xs: 12, md: 4 }}>
//               <FormControl fullWidth>
//                 <InputLabel>Priority</InputLabel>
//                 <Select
//                   label="Priority"
//                   value={filters.priority}
//                   onChange={handleSelectFilterChange('priority')}
//                 >
//                   <MenuItem value="">All</MenuItem>
//                   <MenuItem value="LOW">Low</MenuItem>
//                   <MenuItem value="MEDIUM">Medium</MenuItem>
//                   <MenuItem value="HIGH">High</MenuItem>
//                   <MenuItem value="URGENT">Urgent</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardContent>
//           <DataGrid
//             rows={filteredTasks}
//             columns={columns}
//             autoHeight
//             density="comfortable"
//             pageSizeOptions={[10, 25, 50]}
//             disableRowSelectionOnClick
//             initialState={{
//               pagination: { paginationModel: { page: 0, pageSize: 10 } },
//             }}
//           />
//         </CardContent>
//       </Card>

//       <Dialog
//         open={createDialogOpen}
//         onClose={() => setCreateDialogOpen(false)}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle>Create New Task</DialogTitle>
//         <DialogContent>
//           <Box display="flex" flexDirection="column" gap={2} pt={1}>
//             <TextField
//               label="Title"
//               value={newTask.title}
//               onChange={event => setNewTask(prev => ({ ...prev, title: event.target.value }))}
//               fullWidth
//             />
//             <TextField
//               label="Description"
//               value={newTask.description}
//               onChange={event => setNewTask(prev => ({ ...prev, description: event.target.value }))}
//               fullWidth
//               multiline
//               minRows={3}
//             />
//             <FormControl fullWidth>
//               <InputLabel>Status</InputLabel>
//               <Select
//                 label="Status"
//                 value={newTask.status}
//                 onChange={event =>
//                   setNewTask(prev => ({ ...prev, status: event.target.value as TaskStatus }))
//                 }
//               >
//                 <MenuItem value="TODO">To Do</MenuItem>
//                 <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
//                 <MenuItem value="REVIEW">Review</MenuItem>
//                 <MenuItem value="DONE">Done</MenuItem>
//               </Select>
//             </FormControl>
//             <FormControl fullWidth>
//               <InputLabel>Priority</InputLabel>
//               <Select
//                 label="Priority"
//                 value={newTask.priority}
//                 onChange={event =>
//                   setNewTask(prev => ({ ...prev, priority: event.target.value as TaskPriority }))
//                 }
//               >
//                 <MenuItem value="LOW">Low</MenuItem>
//                 <MenuItem value="MEDIUM">Medium</MenuItem>
//                 <MenuItem value="HIGH">High</MenuItem>
//                 <MenuItem value="URGENT">Urgent</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
//           <Button
//             variant="contained"
//             onClick={handleCreateTask}
//             disabled={createTask.isPending || !newTask.title}
//           >
//             {createTask.isPending ? 'Creating...' : 'Create'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   )
// }

// export default TasksPage
