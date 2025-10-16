import { Box, Typography } from '@mui/material';

const PlaceholderPage = ({ title }: { title: string | undefined }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">{title}</Typography>
      <Typography>This is a placeholder page. The actual content will be implemented here.</Typography>
    </Box>
  );
};

export default PlaceholderPage;
