import { Card, CardContent, Grid, Skeleton } from '@mui/material'

/**
 * Total Growth Bar Chart Skeleton Component
 * TODO: Complete conversion from ui-component/cards/Skeleton/TotalGrowthBarChart.js
 */
function SkeletonTotalGrowthBarChart() {
  return (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container alignContent="center" justifyContent="space-between">
              <Grid item>
                <Skeleton variant="text" width={120} />
              </Grid>
              <Grid item>
                <Skeleton variant="circular" width={20} height={20} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Skeleton variant="text" />
              </Grid>
              <Grid item xs={6}>
                <Skeleton variant="text" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default SkeletonTotalGrowthBarChart

