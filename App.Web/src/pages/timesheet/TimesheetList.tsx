import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
  Stack,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';

import { TimesheetsService } from '@/lib/api';

const TimesheetList = () => {
  const {
    data: timesheets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['timesheets'],
    queryFn: () => TimesheetsService.getAllTimesheetsForUser(),
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Timesheets...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        <Typography>Error loading timesheets: {error.message}</Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Timesheets
        </Typography>
        <Button variant="contained" color="primary" component={RouterLink} to="/timesheet/new">
          Create New Timesheet
        </Button>
      </Stack>

      {timesheets && timesheets.length > 0 ? (
        <List component={Paper} elevation={1}>
          {timesheets.map((timesheet) => (
            <ListItem
              key={timesheet.id}
              divider
              component={RouterLink}
              to={`/timesheet/${timesheet.id}`}
            >
              <ListItemText
                primary={`Timesheet for ${timesheet.periodStart} to ${timesheet.periodEnd}`}
                secondary={`Status: ${timesheet.status} | Total Minutes: ${timesheet.totalMinutes}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info">
          <Typography>No timesheets found. Create your first timesheet!</Typography>
        </Alert>
      )}
    </Box>
  );
};

export default TimesheetList;
