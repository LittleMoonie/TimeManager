import { Avatar, Box, Card, CardContent, Chip, Typography } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { PageHeader } from '@/components/ui/PageHeader';

const demoPeople = [
  {
    id: '1',
    name: 'Haley James',
    role: 'Product Manager',
    status: 'Active',
    initials: 'HJ',
    team: 'Product',
  },
  {
    id: '2',
    name: 'Lucas Scott',
    role: 'Lead Engineer',
    status: 'Active',
    initials: 'LS',
    team: 'Platform',
  },
  {
    id: '3',
    name: 'Peyton Sawyer',
    role: 'Design Lead',
    status: 'On leave',
    initials: 'PS',
    team: 'Design',
  },
];

const PeoplePage = () => (
  <Box display="flex" flexDirection="column" gap={3}>
    <PageHeader
      title="People"
      subtitle="Overview of teammates, their roles, and status across the organization."
    />

    <Grid container spacing={3}>
      {demoPeople.map((person) => (
        <Grid item xs={12} md={4} key={person.id}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar>{person.initials}</Avatar>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {person.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {person.role}
                  </Typography>
                </Box>
                <Chip
                  label={person.status}
                  color={person.status === 'Active' ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                Team: {person.team}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default PeoplePage;
