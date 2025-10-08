import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, CheckCircle, Edit, FilterAlt, Refresh } from '@mui/icons-material';
import { DataGrid, type GridColDef, type GridRowSelectionModel, type GridRowModel } from '@mui/x-data-grid';
import dayjs from 'dayjs';

import { useAuth, useDataStore } from '@/store';
import type { Task, TaskPriority, TaskStatus } from '@/types';
import { useI18n } from '@/i18n';

const statusOptions: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED'];
const priorityOptions: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const TasksPanel = () => {
  const { t } = useI18n();
  const { can } = useAuth();
  const {
    tasks,
    users,
    projects,
    addTask,
    updateTask,
    removeTask,
    refreshTasks,
  } = useDataStore((state) => ({
    tasks: state.tasks,
    users: state.users,
    projects: state.projects,
    addTask: state.addTask,
    updateTask: state.updateTask,
    removeTask: state.removeTask,
    refreshTasks: state.refreshTasks,
  }));

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<string | 'all'>('all');
  const [kanbanView, setKanbanView] = useState(false);
  const [selection, setSelection] = useState<GridRowSelectionModel>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({ title: '', status: 'TODO', priority: 'MEDIUM' });
  const [reassignOpen, setReassignOpen] = useState(false);
  const [bulkAssignee, setBulkAssignee] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (search && !`${task.title} ${task.description ?? ''}`.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      if (assigneeFilter !== 'all' && task.assigneeId !== assigneeFilter) {
        return false;
      }
      if (projectFilter !== 'all' && task.projectId !== projectFilter) {
        return false;
      }
      return true;
    });
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter, projectFilter]);

  const processRowUpdate = async (row: GridRowModel) => {
    try {
      await updateTask(row.id as string, {
        title: row.title,
        status: row.status,
        priority: row.priority,
        assigneeId: row.assigneeId || undefined,
        projectId: row.projectId || undefined,
        dueDate: row.dueDate,
      });
      return row;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: t('tasks.columns.title'),
      flex: 2,
      editable: can('task.manage'),
    },
    {
      field: 'status',
      headerName: t('tasks.columns.status'),
      flex: 1,
      type: 'singleSelect',
      valueOptions: statusOptions.map((status) => ({ value: status, label: status })),
      editable: can('task.manage'),
    },
    {
      field: 'priority',
      headerName: t('tasks.columns.priority'),
      flex: 1,
      type: 'singleSelect',
      valueOptions: priorityOptions.map((priority) => ({ value: priority, label: priority })),
      editable: can('task.manage'),
    },
    {
      field: 'projectId',
      headerName: t('tasks.columns.project'),
      flex: 1,
      valueGetter: (params) => projects.find((project) => project.id === params.value)?.name ?? '—',
      editable: can('task.manage'),
      type: 'singleSelect',
      valueOptions: projects.map((project) => ({ value: project.id, label: project.name })),
    },
    {
      field: 'assigneeId',
      headerName: t('tasks.columns.assignee'),
      flex: 1,
      valueGetter: (params) => {
        const user = users.find((user) => user.id === params.value);
        return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
      },
      editable: can('task.manage'),
      type: 'singleSelect',
      valueOptions: users.map((user) => ({ value: user.id, label: `${user.firstName} ${user.lastName}` })),
    },
    {
      field: 'dueDate',
      headerName: t('tasks.columns.dueDate'),
      flex: 1,
      valueFormatter: ({ value }) => (value ? dayjs(value as string).format('YYYY-MM-DD') : '—'),
      editable: can('task.manage'),
    },
  ];

  const handleCreateTask = async () => {
    if (!newTask.title) return;
    await addTask({
      title: newTask.title,
      description: newTask.description,
      status: newTask.status ?? 'TODO',
      priority: newTask.priority ?? 'MEDIUM',
      assigneeId: newTask.assigneeId,
      projectId: newTask.projectId,
      dueDate: newTask.dueDate,
    });
    setShowCreateDialog(false);
    setNewTask({ title: '', status: 'TODO', priority: 'MEDIUM' });
  };

  const handleBulkComplete = async () => {
    await Promise.all(selection.map((id) => updateTask(id as string, { status: 'DONE' })));
    await refreshTasks();
    setSelection([]);
  };

  const handleBulkReassign = async () => {
    await Promise.all(selection.map((id) => updateTask(id as string, { assigneeId: bulkAssignee || undefined })));
    await refreshTasks();
    setSelection([]);
    setReassignOpen(false);
  };

  const kanbanColumns = statusOptions.filter((status) => status !== 'CANCELLED');

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title={t('tasks.title')}
          action={
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">{t('tasks.kanbanToggle')}</Typography>
              <Switch checked={kanbanView} onChange={(_, checked) => setKanbanView(checked)} />
              <Tooltip title={t('actions.refresh')}>
                <IconButton onClick={() => refreshTasks()}>
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
              {can('task.manage') && (
                <Button startIcon={<Add />} onClick={() => setShowCreateDialog(true)} variant="contained">
                  {t('actions.addTask')}
                </Button>
              )}
            </Stack>
          }
        />
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                label={t('tasks.filters.search')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                InputProps={{ startAdornment: <FilterAlt fontSize="small" sx={{ mr: 1 }} /> }}
              />
            </Grid>
            <Grid xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('tasks.filters.status')}</InputLabel>
                <Select value={statusFilter} label={t('tasks.filters.status')} onChange={(event) => setStatusFilter(event.target.value as TaskStatus | 'all')}>
                  <MenuItem value="all">{t('tasks.filters.allStatuses')}</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('tasks.filters.priority')}</InputLabel>
                <Select value={priorityFilter} label={t('tasks.filters.priority')} onChange={(event) => setPriorityFilter(event.target.value as TaskPriority | 'all')}>
                  <MenuItem value="all">{t('tasks.filters.allPriorities')}</MenuItem>
                  {priorityOptions.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('tasks.filters.assignee')}</InputLabel>
                <Select value={assigneeFilter} label={t('tasks.filters.assignee')} onChange={(event) => setAssigneeFilter(event.target.value as string | 'all')}>
                  <MenuItem value="all">{t('tasks.filters.allAssignees')}</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>{t('tasks.filters.project')}</InputLabel>
                <Select value={projectFilter} label={t('tasks.filters.project')} onChange={(event) => setProjectFilter(event.target.value as string | 'all')}>
                  <MenuItem value="all">{t('tasks.filters.allProjects')}</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {!kanbanView ? (
        <Card>
          <CardContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {selection.length > 0 && can('task.manage') && (
              <Stack direction="row" spacing={1} mb={2}>
                <Button startIcon={<CheckCircle />} color="success" variant="contained" onClick={handleBulkComplete}>
                  {t('tasks.bulk.complete')}
                </Button>
                <Button startIcon={<Edit />} variant="outlined" onClick={() => setReassignOpen(true)}>
                  {t('tasks.bulk.reassign')}
                </Button>
              </Stack>
            )}
            <DataGrid
              autoHeight
              density="comfortable"
              rows={filteredTasks}
              columns={columns}
              checkboxSelection={can('task.manage')}
              disableRowSelectionOnClick
              onRowSelectionModelChange={setSelection}
              rowSelectionModel={selection}
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={(err) => setError(err instanceof Error ? err.message : t('tasks.updateError'))}
              experimentalFeatures={{ newEditingApi: true }}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {kanbanColumns.map((status) => (
            <Grid xs={12} md={3} key={status}>
              <Card>
                <CardHeader title={status} />
                <CardContent>
                  <Stack spacing={1.5}>
                    {filteredTasks.filter((task) => task.status === status).map((task) => (
                      <Box key={task.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                        <Typography variant="subtitle2">{task.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {task.dueDate ? dayjs(task.dueDate).format('MMM D') : t('tasks.noDueDate')}
                        </Typography>
                      </Box>
                    ))}
                    {filteredTasks.filter((task) => task.status === status).length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        {t('tasks.emptyColumn')}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('tasks.createTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label={t('tasks.form.title')}
              value={newTask.title ?? ''}
              onChange={(event) => setNewTask((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <TextField
              label={t('tasks.form.description')}
              value={newTask.description ?? ''}
              onChange={(event) => setNewTask((prev) => ({ ...prev, description: event.target.value }))}
              multiline
              minRows={3}
            />
            <FormControl fullWidth>
              <InputLabel>{t('tasks.columns.status')}</InputLabel>
              <Select
                value={newTask.status ?? 'TODO'}
                label={t('tasks.columns.status')}
                onChange={(event) => setNewTask((prev) => ({ ...prev, status: event.target.value as TaskStatus }))}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('tasks.columns.priority')}</InputLabel>
              <Select
                value={newTask.priority ?? 'MEDIUM'}
                label={t('tasks.columns.priority')}
                onChange={(event) => setNewTask((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))}
              >
                {priorityOptions.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('tasks.columns.assignee')}</InputLabel>
              <Select
                value={newTask.assigneeId ?? ''}
                label={t('tasks.columns.assignee')}
                onChange={(event) => setNewTask((prev) => ({ ...prev, assigneeId: event.target.value || undefined }))}
                displayEmpty
              >
                <MenuItem value="">{t('tasks.unassigned')}</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('tasks.columns.project')}</InputLabel>
              <Select
                value={newTask.projectId ?? ''}
                label={t('tasks.columns.project')}
                onChange={(event) => setNewTask((prev) => ({ ...prev, projectId: event.target.value || undefined }))}
                displayEmpty
              >
                <MenuItem value="">{t('tasks.unassignedProject')}</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              type="date"
              label={t('tasks.columns.dueDate')}
              InputLabelProps={{ shrink: true }}
              value={newTask.dueDate?.slice(0, 10) ?? ''}
              onChange={(event) => setNewTask((prev) => ({ ...prev, dueDate: event.target.value ? dayjs(event.target.value).endOf('day').toISOString() : undefined }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>{t('tasks.cancel')}</Button>
          <Button onClick={handleCreateTask} variant="contained" disabled={!newTask.title}>
            {t('tasks.createSubmit')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reassignOpen} onClose={() => setReassignOpen(false)}>
        <DialogTitle>{t('tasks.bulk.reassignTitle')}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>{t('tasks.columns.assignee')}</InputLabel>
            <Select value={bulkAssignee} label={t('tasks.columns.assignee')} onChange={(event) => setBulkAssignee(event.target.value)} displayEmpty>
              <MenuItem value="">{t('tasks.unassigned')}</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReassignOpen(false)}>{t('tasks.cancel')}</Button>
          <Button onClick={handleBulkReassign} variant="contained" disabled={selection.length === 0}>
            {t('tasks.bulk.reassign')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default TasksPanel;
