import { Box, Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import type { Task } from '@/types';

const getTaskMetrics = (tasks: Task[]) => {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === 'DONE').length;
  const inProgress = tasks.filter((task) => task.status === 'IN_PROGRESS').length;

  return {
    total,
    completed,
    inProgress,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

const HomePage = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useTasks({ limit: 5 });

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load dashboard data" />;
  }

  const tasks = data?.data ?? [];
  const metrics = getTaskMetrics(tasks);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <PageHeader
        title={`Welcome back, ${user?.firstName ?? 'there'}!`}
        subtitle="Here is a quick snapshot of your work today."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h4">{metrics.total}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {metrics.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4" color="warning.main">
                {metrics.inProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completion Rate
              </Typography>
              <Typography variant="h4" color="info.main">
                {metrics.completionRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Tasks
          </Typography>

          {tasks.length === 0 ? (
            <Typography color="text.secondary">No tasks found. Create your first task to get started.</Typography>
          ) : (
            <Box display="flex" flexDirection="column">
              {tasks.slice(0, 5).map((task) => (
                <Box
                  key={task.id}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1}
                  borderBottom="1px solid"
                  borderColor="divider"
                >
                  <Typography variant="body1">{task.title}</Typography>
                  <Typography
                    variant="caption"
                    color={
                      task.status === 'DONE'
                        ? 'success.main'
                        : task.status === 'IN_PROGRESS'
                        ? 'warning.main'
                        : 'text.secondary'
                    }
                  >
                    {task.status}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default HomePage;
