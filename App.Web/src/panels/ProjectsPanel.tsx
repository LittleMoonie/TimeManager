import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Drawer,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Close } from '@mui/icons-material';

import { useDataStore } from '@/store';
import type { ProjectWithStats, Task, Team, User } from '@/types';
import { useI18n } from '@/i18n';

const statusColors: Record<string, 'success' | 'warning' | 'default'> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  ARCHIVED: 'default',
};

const findProjectOwner = (project: ProjectWithStats, users: User[], teams: Team[], tasks: Task[]): User | undefined => {
  const projectTasks = tasks.filter((task) => task.projectId === project.id && task.assigneeId);
  if (projectTasks.length === 0) {
    return users.find((user) => user.role === 'MANAGER');
  }
  const counts = new Map<string, number>();
  projectTasks.forEach((task) => {
    const assignee = users.find((user) => user.id === task.assigneeId);
    if (assignee?.teamId) {
      counts.set(assignee.teamId, (counts.get(assignee.teamId) ?? 0) + 1);
    }
  });
  const topTeamId = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!topTeamId) {
    return users.find((user) => user.role === 'MANAGER');
  }
  const team = teams.find((entry) => entry.id === topTeamId);
  if (!team) return undefined;
  return users.find((user) => user.id === team.managerId);
};

const ProjectsPanel = () => {
  const { t } = useI18n();
  const { projects, tasks, users, teams } = useDataStore((state) => ({
    projects: state.projects,
    tasks: state.tasks,
    users: state.users,
    teams: state.teams,
  }));

  const [selectedProject, setSelectedProject] = useState<ProjectWithStats | null>(null);

  const rows = useMemo(
    () =>
      projects.map((project) => {
        const owner = findProjectOwner(project, users, teams, tasks);
        return {
          ...project,
          owner,
          activeTasksLabel: project.activeTasks,
        };
      }),
    [projects, tasks, teams, users],
  );

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('projects.columns.name'), flex: 1.6 },
    {
      field: 'status',
      headerName: t('projects.columns.status'),
      flex: 1,
      renderCell: (params) => <Chip label={params.value} size="small" color={statusColors[params.value as string] ?? 'default'} />,
    },
    {
      field: 'owner',
      headerName: t('projects.columns.owner'),
      flex: 1,
      valueGetter: (params) => {
        const owner = params.row.owner as User | undefined;
        return owner ? `${owner.firstName} ${owner.lastName}` : t('projects.noOwner');
      },
    },
    {
      field: 'activeTasks',
      headerName: t('projects.columns.activeTasks'),
      flex: 0.6,
    },
    {
      field: 'progress',
      headerName: t('projects.columns.progress'),
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
          <LinearProgress variant="determinate" value={params.value as number} sx={{ flexGrow: 1 }} />
          <Typography variant="caption">{params.value}%</Typography>
        </Stack>
      ),
    },
  ];

  const handleRowClick = (row: ProjectWithStats) => {
    setSelectedProject(row);
  };

  const selectedTasks = useMemo(() => {
    if (!selectedProject) return [] as Task[];
    return tasks.filter((task) => task.projectId === selectedProject.id).slice(0, 8);
  }, [selectedProject, tasks]);

  const drawerOwner = useMemo(() => {
    if (!selectedProject) return undefined;
    return findProjectOwner(selectedProject, users, teams, tasks);
  }, [selectedProject, users, teams, tasks]);

  return (
    <>
      <Card>
        <CardContent>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            pageSizeOptions={[5, 10]}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            onRowClick={(params) => handleRowClick(params.row as ProjectWithStats)}
          />
        </CardContent>
      </Card>

      <Drawer anchor="right" open={Boolean(selectedProject)} onClose={() => setSelectedProject(null)} sx={{ '& .MuiDrawer-paper': { width: 360, p: 3 } }}>
        {selectedProject && (
          <Stack spacing={2} height="100%">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{selectedProject.name}</Typography>
              <IconButton onClick={() => setSelectedProject(null)}>
                <Close />
              </IconButton>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {selectedProject.description ?? t('projects.noDescription')}
            </Typography>
            <Stack spacing={1}>
              <Typography variant="subtitle2">{t('projects.details.owner')}</Typography>
              <Typography>
                {drawerOwner ? `${drawerOwner.firstName} ${drawerOwner.lastName}` : t('projects.noOwner')}
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle2">{t('projects.details.progress')}</Typography>
              <LinearProgress variant="determinate" value={selectedProject.progress} />
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle2">{t('projects.details.tasks')}</Typography>
              {selectedTasks.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  {t('projects.noTasks')}
                </Typography>
              )}
              {selectedTasks.map((task) => (
                <Box key={task.id} sx={{ border: '1px solid', borderColor: 'divider', p: 1.5, borderRadius: 1 }}>
                  <Typography variant="subtitle2">{task.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(() => {
                      const assignee = users.find((user) => user.id === task.assigneeId);
                      const assigneeLabel = assignee ? `${assignee.firstName} ${assignee.lastName}` : t('projects.unassigned');
                      return t('projects.taskInfo', { status: task.status, assignee: assigneeLabel });
                    })()}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        )}
      </Drawer>
    </>
  );
};

export default ProjectsPanel;
