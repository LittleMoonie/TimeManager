import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { Avatar, Box, Grid, Menu, MenuItem, Typography } from '@mui/material'

// Project imports
import MainCard from '@/components/cards/MainCard'

// Assets
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

interface TotalOrderLineChartCardProps {
  isLoading?: boolean
}

/**
 * Total Order Line Chart Card Component
 * TODO: Complete conversion with actual chart from views/dashboard/Default/TotalOrderLineChartCard.js
 */
function TotalOrderLineChartCard({ isLoading }: TotalOrderLineChartCardProps) {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <MainCard>
      <Box sx={{ p: 2.25 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                backgroundColor: theme.palette.primary.dark,
                color: '#fff'
              }}
            >
              <ArrowUpwardIcon fontSize="inherit" />
            </Avatar>
          </Grid>
          <Grid>
            <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                backgroundColor: theme.palette.secondary.dark,
                color: theme.palette.secondary[200],
                zIndex: 1
              }}
              aria-controls="menu-total-order-card"
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreHorizIcon fontSize="inherit" />
            </Avatar>
            <Menu
              id="menu-total-order-card"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
              variant="selectedMenu"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
            >
              <MenuItem onClick={handleClose}>Today</MenuItem>
              <MenuItem onClick={handleClose}>This Month</MenuItem>
              <MenuItem onClick={handleClose}>This Year</MenuItem>
            </Menu>
          </Grid>
        </Grid>
        
        <Grid container direction="column">
          <Grid sx={{ mb: 0.75 }}>
            <Typography
              sx={{
                fontSize: '2.125rem',
                fontWeight: 500,
                color: theme.palette.primary.dark
              }}
            >
              486
            </Typography>
          </Grid>
          <Grid>
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 500,
                color: theme.palette.secondary.dark
              }}
            >
              Total Order
            </Typography>
          </Grid>
        </Grid>
        
        {/* Placeholder for chart */}
        <Box
          sx={{
            mt: 2,
            height: 100,
            backgroundColor: theme.palette.primary.light,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="body2" color="textSecondary">
            Line Chart (TODO)
          </Typography>
        </Box>
      </Box>
    </MainCard>
  )
}

export default TotalOrderLineChartCard

