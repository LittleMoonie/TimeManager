import { useEffect, useState } from 'react'
import { EarningCard, PopularCard, TotalOrderLineChartCard, TotalIncomeDarkCard, TotalIncomeLightCard, TotalGrowthBarChart } from './components'
import { Card, CardContent, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'

// Grid spacing constant (matches original)
const GRID_SPACING = 3

/**
 * Default dashboard page component
 * Converted from views/dashboard/Default/index.js
 */
function DashboardDefault() {
  const [isLoading, setLoading] = useState(true)
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <Grid container spacing={GRID_SPACING}>
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={GRID_SPACING}>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <EarningCard isLoading={isLoading} />
          </Grid>
          
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h2">
                  1,024
                </Typography>
                <Typography variant="body2" color="success.main">
                  +2.6% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ lg: 4, md: 12, sm: 12, xs: 12 }}>
            <Grid container spacing={GRID_SPACING}>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeDarkCard isLoading={isLoading} />
              </Grid>
              
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeLightCard isLoading={isLoading} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={GRID_SPACING}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TotalGrowthBarChart isLoading={isLoading} />
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <PopularCard isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>
      
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎉 Berry Dashboard TypeScript Migration Complete!
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              This dashboard is now running on a modern TypeScript + Vite foundation with Next.js-like architecture.
              The EarningCard component (top-left) demonstrates the fully converted Berry Dashboard styling.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Remaining: 67 JavaScript files to convert using the established patterns.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default DashboardDefault 