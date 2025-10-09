import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from '@mui/material';

type Person = {
  id: string;
  name: string;
  role: string;
  team: string;
  status: 'Active' | 'On leave' | 'Inactive';
  initials: string;
};

const mockPeople: Person[] = [
  {
    id: '1',
    name: 'Haley James',
    role: 'Product Manager',
    team: 'Product',
    status: 'Active',
    initials: 'HJ',
  },
  {
    id: '2',
    name: 'Lucas Scott',
    role: 'Lead Engineer',
    team: 'Platform',
    status: 'Active',
    initials: 'LS',
  },
  {
    id: '3',
    name: 'Peyton Sawyer',
    role: 'Design Lead',
    team: 'Design',
    status: 'On leave',
    initials: 'PS',
  },
];

const getStatusColor = (status: Person['status']) => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'On leave':
      return 'warning';
    case 'Inactive':
      return 'error';
  }
};

const PeoplePage = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={600} gutterBottom>
          People
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of teammates, their roles, and status across the organization.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {mockPeople.map((person) => (
          <Grid size={{xs: 12, sm: 6, md: 4}} key={person.id}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[8],
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    bgcolor: 'primary.main',
                  }}
                >
                  {person.initials}
                </Avatar>
                
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {person.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {person.role}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Team: {person.team}
                </Typography>
                
                <Chip
                  label={person.status}
                  color={getStatusColor(person.status)}
                  size="small"
                  variant="filled"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PeoplePage;