import { Box, Card, CardContent, FormControlLabel, Switch, TextField, Typography, Grid } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { useThemeController } from '@/themes';

const SettingsPage = () => {
  const { mode, toggleMode } = useThemeController();

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <PageHeader
        title="Settings"
        subtitle="Configure personal preferences and tailor GoGoTime to your workflow."
      />

      <Grid container spacing={3}>
        <Grid size={{xs:12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField label="First name" placeholder="Haley" fullWidth />
                <TextField label="Last name" placeholder="James" fullWidth />
                <TextField label="Title" placeholder="Product Manager" fullWidth />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, md: 6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <FormControlLabel
                control={<Switch checked={mode === 'lagoon-dark'} onChange={toggleMode} />}
                label="Dark mode"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
