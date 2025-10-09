import { Avatar, Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'NA';

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <PageHeader title="Profile" subtitle="Manage your info, security, and personal preferences." />

      <Grid container spacing={3}>
        <Grid size={{xs: 12, md: 4}}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 96, height: 96, fontSize: '2rem' }}>{initials}</Avatar>
              <Typography variant="h6">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email ?? 'Not signed in'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, md: 8}}>

          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Account details
              </Typography>
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    First name
                  </Typography>
                  <Typography variant="body1">{user?.firstName ?? '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Last name
                  </Typography>
                  <Typography variant="body1">{user?.lastName ?? '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body1">{user?.role ?? '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1">{user?.status ?? '—'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
