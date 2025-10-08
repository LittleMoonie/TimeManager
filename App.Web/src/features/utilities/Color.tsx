import { Typography, Card, CardContent, Box, Grid, Paper } from '@mui/material'
import { useTheme } from '@mui/material/styles'

/**
 * Color utility page
 * TODO: Migrate from views/utilities/Color.js
 */
function ColorPage() {
  const theme = useTheme()

  const colorPalette = [
    { name: 'Primary', color: theme.palette.primary.main },
    { name: 'Secondary', color: theme.palette.secondary.main },
    { name: 'Error', color: theme.palette.error.main },
    { name: 'Warning', color: theme.palette.warning.main },
    { name: 'Info', color: theme.palette.info.main },
    { name: 'Success', color: theme.palette.success.main },
  ]

  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        Colors
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Theme Color Palette
              </Typography>
              <Grid container spacing={2}>
                {colorPalette.map((item) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.name}>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: item.color,
                        color: theme.palette.getContrastText(item.color),
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        {item.name}
                      </Typography>
                      <Typography variant="body2">
                        {item.color}
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

export default ColorPage
