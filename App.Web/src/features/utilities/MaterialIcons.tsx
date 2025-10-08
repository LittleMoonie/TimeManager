import { Typography, Card, CardContent, Box, Grid, IconButton } from '@mui/material'
import {
  Home,
  Settings, 
  Person,
  Search,
  Favorite,
  Star,
  Delete,
  Add,
  Edit,
  Save,
  Close,
  Menu,
} from '@mui/icons-material'

/**
 * Material Icons utility page
 * TODO: Migrate from views/utilities/MaterialIcons.js
 */
function MaterialIconsPage() {
  const icons = [
    { name: 'Home', icon: Home },
    { name: 'Settings', icon: Settings },
    { name: 'Person', icon: Person },
    { name: 'Search', icon: Search },
    { name: 'Favorite', icon: Favorite },
    { name: 'Star', icon: Star },
    { name: 'Delete', icon: Delete },
    { name: 'Add', icon: Add },
    { name: 'Edit', icon: Edit },
    { name: 'Save', icon: Save },
    { name: 'Close', icon: Close },
    { name: 'Menu', icon: Menu },
  ]

  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        Material Icons
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Material-UI Icon Collection
              </Typography>
              <Grid container spacing={2}>
                {icons.map((item) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={item.name}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <IconButton size="large" color="primary">
                        <item.icon />
                      </IconButton>
                      <Typography variant="body2" textAlign="center">
                        {item.name}
                      </Typography>
                    </Box>
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

export default MaterialIconsPage
