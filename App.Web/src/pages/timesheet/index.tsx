import { Box, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';

const mockTimesheet = [
  { id: 1, date: '2024-10-14', project: 'GoGoTime Web', hours: 6.25, status: 'Approved' },
  { id: 2, date: '2024-10-15', project: 'GoGoTime API', hours: 7.5, status: 'Pending' },
  { id: 3, date: '2024-10-16', project: 'Product discovery', hours: 5, status: 'Approved' },
];

const TimesheetPage = () => (
  <Box display="flex" flexDirection="column" gap={3}>
    <PageHeader
      title="Timesheet"
      subtitle="Record daily work, review team submissions, and keep payroll accurate."
    />

    <Card>
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockTimesheet.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                <TableCell>{entry.project}</TableCell>
                <TableCell>{entry.hours.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    color={entry.status === 'Approved' ? 'success.main' : entry.status === 'Pending' ? 'warning.main' : 'text.secondary'}
                  >
                    {entry.status}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </Box>
);

export default TimesheetPage;
