import {
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';

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
];

const ReportsPage = () => (
  <Box display="flex" flexDirection="column" gap={3}>
    <PageHeader
      title="Reports"
      subtitle="Generate analytics that keep leadership aligned and unblock teams faster."
    />

    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Available reports
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List disablePadding>
          {reportSummaries.map((report, index) => (
            <ListItem
              key={report.id}
              divider={index < reportSummaries.length - 1}
              sx={{ alignItems: 'flex-start', py: 2 }}
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
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  </Box>
);

export default ReportsPage;
