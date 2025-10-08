import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { Avatar, Box, Grid, Menu, MenuItem, Typography } from '@mui/material'

// Project imports
import MainCard from '@/components/cards/MainCard'

// Assets
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'

interface TotalGrowthBarChartProps {
  isLoading?: boolean
}

/**
 * Total Growth Bar Chart Component
 * TODO: Complete conversion with actual chart from views/dashboard/Default/TotalGrowthBarChart.js
 */
function TotalGrowthBarChart({ isLoading }: TotalGrowthBarChartProps) {
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
            <Typography variant="h6">Total Growth</Typography>
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
              aria-controls="menu-growth-bar-card"
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreHorizIcon fontSize="inherit" />
            </Avatar>
            <Menu
              id="menu-growth-bar-card"
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

        {/* Placeholder for chart */}
        <Box
          sx={{
            mt: 2,
            height: 300,
            backgroundColor: theme.palette.grey[50],
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h6" color="textSecondary">
            Bar Chart Component
          </Typography>
        </Box>

        <Grid container sx={{ mt: 1.5 }}>
          <Grid xs={6}>
            <Grid container alignItems="center">
              <Grid>
                <Typography variant="subtitle2" color="inherit">
                  Total Growth
                </Typography>
              </Grid>
              <Grid>
                <Avatar
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '5px',
                    backgroundColor: theme.palette.success.light,
                    color: theme.palette.success.dark,
                    ml: 2
                  }}
                >
                  <ArrowUpwardIcon fontSize="inherit" sx={{ transform: 'rotate3d(1, 1, 1, 45deg)' }} />
                </Avatar>
              </Grid>
            </Grid>
          </Grid>
          <Grid xs={6}>
            <Typography variant="subtitle2" color="inherit">
              16,15%
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  )
}

export default TotalGrowthBarChart

