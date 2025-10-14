import { Avatar, Box, Card, CardContent, Typography, Chip, Stack, Divider } from '@mui/material';
import { Email, Phone, LocationOn } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

export const ProfileSummaryCard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No user data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <Card>
      <CardContent>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Avatar sx={{ width: 96, height: 96, fontSize: '2rem' }}>
            {initials}
          </Avatar>

          <Box>
            <Typography variant="h6">{fullName}</Typography>
            {user.role?.name && (
              <Typography variant="body2" color="text.secondary">
                {user.role.name}
              </Typography>
            )}
            {user.company?.name && (
              <Typography variant="body2" color="text.secondary">
                {user.company.name}
              </Typography>
            )}
          </Box>

          <Divider flexItem />

          <Box width="100%" textAlign="left">
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Contact
            </Typography>
            <Stack spacing={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>

              {user.phoneNumber && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {user.phoneNumber}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
