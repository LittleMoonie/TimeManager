import { Typography, Card, CardContent, Box, Grid, Paper } from '@mui/material'

/**
 * Shadow utility page  
 * TODO: Migrate from views/utilities/Shadow.js
 */
function ShadowPage() {
  const shadowLevels = Array.from({ length: 25 }, (_, i) => i)

  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        Shadows
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Material-UI Elevation Levels
              </Typography>
              <Grid container spacing={3}>
                {shadowLevels.map((level) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={level}>
                    <Paper
                      elevation={level}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        minHeight: 80,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        Elevation {level}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ShadowPage
