import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import {
  Avatar,
  Button,
  CardActions,
  CardContent,
  Divider,
  Grid,
  Menu,
  MenuItem,
  Typography
} from '@mui/material'

// Project imports
import MainCard from '@/components/cards/MainCard'
import SkeletonPopularCard from '@/components/cards/skeleton/PopularCard'
import BajajAreaChartCard from './BajajAreaChartCard'
import { GRID_SPACING } from '@/lib/constants'

// Assets
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined'
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined'
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'

interface PopularCardProps {
  isLoading?: boolean
}

interface StockData {
  name: string
  price: string
  change: string
  isPositive: boolean
}

const stockData: StockData[] = [
  { name: 'Bajaj Finery', price: '$1839.00', change: '10% Profit', isPositive: true },
  { name: 'TTML', price: '$100.00', change: '10% loss', isPositive: false },
  { name: 'Reliance', price: '$200.00', change: '10% Profit', isPositive: true },
  { name: 'TTML', price: '$189.00', change: '10% loss', isPositive: false },
  { name: 'Stolon', price: '$189.00', change: '10% loss', isPositive: false },
]

/**
 * Popular Card Component
 * Converted from views/dashboard/Default/PopularCard.js
 */
function PopularCard({ isLoading = false }: PopularCardProps) {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  if (isLoading) {
    return <SkeletonPopularCard />
  }

  return (
    <MainCard content={false}>
      <CardContent>
        <Grid container spacing={GRID_SPACING}>
          <Grid item xs={12}>
            <Grid container alignContent="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="h4">Popular Stocks</Typography>
              </Grid>
              <Grid item>
                <MoreHorizOutlinedIcon
                  fontSize="small"
                  sx={{
                    color: theme.palette.primary[200],
                    cursor: 'pointer',
                  }}
                  aria-controls="menu-popular-card"
                  aria-haspopup="true"
                  onClick={handleClick}
                />
                <Menu
                  id="menu-popular-card"
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
          </Grid>
          
          <Grid item xs={12} sx={{ pt: '16px !important' }}>
            <BajajAreaChartCard />
          </Grid>
          
          <Grid item xs={12}>
            {stockData.map((stock, index) => (
              <div key={index}>
                <Grid container direction="column">
                  <Grid item>
                    <Grid container alignItems="center" justifyContent="space-between">
                      <Grid item>
                        <Typography variant="subtitle1" color="inherit">
                          {stock.name}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Grid container alignItems="center" justifyContent="space-between">
                          <Grid item>
                            <Typography variant="subtitle1" color="inherit">
                              {stock.price}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '5px',
                                backgroundColor: stock.isPositive 
                                  ? theme.palette.success.light 
                                  : theme.palette.orange?.light,
                                color: stock.isPositive 
                                  ? theme.palette.success.dark 
                                  : theme.palette.orange?.dark,
                                ml: 1.875,
                              }}
                            >
                              {stock.isPositive ? (
                                <KeyboardArrowUpOutlinedIcon fontSize="small" color="inherit" />
                              ) : (
                                <KeyboardArrowDownOutlinedIcon fontSize="small" color="inherit" />
                              )}
                            </Avatar>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: stock.isPositive 
                          ? theme.palette.success.dark 
                          : theme.palette.orange?.dark
                      }}
                    >
                      {stock.change}
                    </Typography>
                  </Grid>
                </Grid>
                {index < stockData.length - 1 && (
                  <Divider sx={{ my: 1.5 }} />
                )}
              </div>
            ))}
          </Grid>
        </Grid>
      </CardContent>
      
      <CardActions
        sx={{
          p: 1.25,
          pt: 0,
          justifyContent: 'center',
        }}
      >
        <Button size="small" disableElevation>
          View All
          <ChevronRightOutlinedIcon />
        </Button>
      </CardActions>
    </MainCard>
  )
}

export default PopularCard

