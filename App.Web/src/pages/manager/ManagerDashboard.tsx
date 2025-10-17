import { Typography, Box } from '@mui/material';

const ManagerDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manager Dashboard
      </Typography>
      <Typography variant="body1">
        Welcome to the Manager Dashboard! You have special permissions.
      </Typography>
    </Box>
  );
};

export default ManagerDashboard;
