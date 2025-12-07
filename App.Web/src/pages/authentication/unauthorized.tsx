import { Box, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          403 - Unauthorized
        </Typography>
        <Typography variant="h6" component="h2" align="center" sx={{ mb: 4 }}>
          You do not have permission to access this page.
        </Typography>
        <Button variant="contained" component={RouterLink} to="/">
          Go to Home
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
