import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { useTasks } from '@/hooks/useTasks'
import type { Task, TaskPriority, TaskStatus } from '@/types'

const statusColors: Record<TaskStatus, 'default' | 'success' | 'warning' | 'info' | 'error'> = {
  TODO: 'default',
  IN_PROGRESS: 'warning',
  REVIEW: 'info',
  DONE: 'success',
  CANCELLED: 'error',
}

const priorityColors: Record<TaskPriority, 'default' | 'success' | 'warning' | 'error'> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'error',
  URGENT: 'error',
}

const timesheetEntries = [
  { id: 'ts-1', date: '2024-10-14', project: 'GoGoTime Web', hours: 6.25, status: 'Approved' },
  { id: 'ts-2', date: '2024-10-15', project: 'GoGoTime API', hours: 7.5, status: 'Pending' },
  { id: 'ts-3', date: '2024-10-16', project: 'Product discovery', hours: 5, status: 'Approved' },
  { id: 'ts-4', date: '2024-10-17', project: 'Design sync', hours: 4, status: 'Pending' },
]

const reportSummaries = [
  {
    id: 'r1',
    title: 'Weekly performance summary',
    description: 'Snapshot of team productivity and velocity.',
  },
  {
    id: 'r2',
    title: 'Time tracking compliance',
    description: 'Highlights missing timesheets and overtime alerts.',
  },
  {
    id: 'r3',
    title: 'Project health',
    description: 'Shows progress, blockers, and upcoming milestones.',
  },
  {
    id: 'r4',
    title: 'Billing preview',
    description: 'Forecasts billable hours and cost allocations.',
  },
]

const settingsShortcuts = [
  {
    id: 's1',
    label: 'Profile',
    description: 'Update contact details and notification preferences.',
  },
  { id: 's2', label: 'Teams', description: 'Manage assignments and approval routing.' },
  { id: 's3', label: 'Integrations', description: 'Connect Slack, Jira, or payroll exports.' },
]

const renderTask = (task: Task) => (
  <Box
    key={task.id}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      p: 2,
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
      <Typography variant="subtitle1" fontWeight={600} noWrap>
        {task.title}
      </Typography>
      <Chip label={task.status} size="small" color={statusColors[task.status]} />
    </Stack>
    {task.description && (
      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
        {task.description}
      </Typography>
    )}
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        label={`Priority: ${task.priority}`}
        size="small"
        color={priorityColors[task.priority]}
        variant="outlined"
      />
      {task.dueDate && (
        <Typography variant="caption" color="text.secondary">
          Due {new Date(task.dueDate).toLocaleDateString()}
        </Typography>
      )}
    </Stack>
  </Box>
)

export const DashboardPage = () => {
  const { data: taskResponse, isLoading: tasksLoading, error: tasksError } = useTasks({ limit: 10 })
  const tasks = taskResponse?.data ?? []

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            lg: '2.1fr 1.3fr 0.8fr',
          },
          gridTemplateRows: { xs: 'auto', lg: 'auto auto auto' },
        }}
      >
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            gridColumn: { xs: '1 / -1', md: '1 / -1', lg: '1 / 2' },
            gridRow: { xs: 'auto', lg: '1 / span 2' },
            minHeight: { xs: 360, md: 400 },
            aspectRatio: { lg: '1 / 1' },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 3,
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                My Tasks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track progress and jump back into your work.
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                pr: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {tasksLoading && (
                <Typography variant="body2" color="text.secondary">
                  Loading tasks...
                </Typography>
              )}
              {tasksError && !tasksLoading && (
                <Typography variant="body2" color="error">
                  Unable to load tasks right now.
                </Typography>
              )}
              {!tasksLoading && !tasksError && tasks.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No tasks yet. Create one from the Tasks workspace to get started.
                </Typography>
              )}
              {!tasksLoading && !tasksError && tasks.map(task => renderTask(task))}
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            gridColumn: { xs: '1 / -1', md: '1 / 2', lg: '2 / 3' },
            gridRow: { xs: 'auto', lg: '1 / span 2' },
            minHeight: { xs: 280, lg: 520 },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 3,
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Timesheet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review recent entries before submitting your week.
              </Typography>
            </Box>
            <Divider />

            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                pr: 1,
              }}
            >
              <List disablePadding>
                {timesheetEntries.map((entry, index) => (
                  <ListItem
                    key={entry.id}
                    divider={index < timesheetEntries.length - 1}
                    sx={{ alignItems: 'flex-start', py: 1.5 }}
                  >
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="baseline"
                          spacing={2}
                        >
                          <Typography variant="subtitle1" fontWeight={600}>
                            {new Date(entry.date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="subtitle2" color="primary">
                            {entry.hours.toFixed(2)} hrs
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.75} sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {entry.project}
                          </Typography>
                          <Chip
                            label={entry.status}
                            size="small"
                            color={
                              entry.status === 'Approved'
                                ? 'success'
                                : entry.status === 'Pending'
                                  ? 'warning'
                                  : 'default'
                            }
                            sx={{ alignSelf: 'flex-start' }}
                          />
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            gridColumn: { xs: '1 / -1', md: '2 / 3', lg: '3 / 4' },
            gridRow: { xs: 'auto', md: '2 / 3', lg: '1 / 2' },
            aspectRatio: { md: '1 / 1', lg: '1 / 1' },
            minHeight: { xs: 220, md: 260 },
            alignSelf: { md: 'start', lg: 'start' },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 3,
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quick links to keep your workspace tidy.
              </Typography>
            </Box>
            <Divider />
            <Stack spacing={1.5} sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
              {settingsShortcuts.map(item => (
                <Box
                  key={item.id}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 1.5,
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            gridColumn: { xs: '1 / -1', md: '1 / -1', lg: '1 / span 3' },
            gridRow: { xs: 'auto', lg: '3 / 4' },
            minHeight: { xs: 260, md: 280 },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 3,
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stay ahead with ready-made analytics and compliance snapshots.
              </Typography>
            </Box>
            <Divider />

            <Box
              sx={{
                flex: 1,
                overflowX: 'auto',
                pr: 1,
              }}
            >
              <List
                disablePadding
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 1.5, md: 2 },
                }}
              >
                {reportSummaries.map(report => (
                  <ListItem
                    key={report.id}
                    sx={{
                      flex: { md: '1 1 0' },
                      px: 0,
                      py: { xs: 1.5, md: 0 },
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.default',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={600}>
                          {report.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {report.description}
                        </Typography>
                      }
                      sx={{ m: 0, px: { md: 2 }, py: { md: 2 } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
