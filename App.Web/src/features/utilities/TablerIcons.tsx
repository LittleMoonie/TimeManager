import { Typography, Card, CardContent, Box, Grid, IconButton } from '@mui/material'
import {
  IconHome,
  IconSettings,
  IconUser,
  IconSearch,
  IconHeart,
  IconStar,
  IconTrash,
  IconPlus,
  IconEdit,
  IconDeviceFloppy,
  IconX,
  IconMenu2,
} from '@tabler/icons-react'

/**
 * Tabler Icons utility page
 * TODO: Migrate from views/utilities/TablerIcons.js
 */
function TablerIconsPage() {
  const icons = [
    { name: 'Home', icon: IconHome },
    { name: 'Settings', icon: IconSettings },
    { name: 'User', icon: IconUser },
    { name: 'Search', icon: IconSearch },
    { name: 'Heart', icon: IconHeart },
    { name: 'Star', icon: IconStar },
    { name: 'Trash', icon: IconTrash },
    { name: 'Plus', icon: IconPlus },
    { name: 'Edit', icon: IconEdit },
    { name: 'Save', icon: IconDeviceFloppy },
    { name: 'Close', icon: IconX },
    { name: 'Menu', icon: IconMenu2 },
  ]

  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        Tabler Icons
      </Typography>
      
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tabler Icons Collection
              </Typography>
              <Grid container spacing={2}>
                {icons.map((item) => (
                  <Grid xs={6} sm={4} md={3} lg={2} key={item.name}>
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
                        <item.icon size={24} />
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

export default TablerIconsPage

