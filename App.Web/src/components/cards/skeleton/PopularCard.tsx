import { Card, CardContent, Grid, Skeleton } from '@mui/material'

/**
 * Skeleton placeholder for PopularCard
 * TODO: Convert from ui-component/cards/Skeleton/PopularCard.js when needed
 */
function SkeletonPopularCard() {
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
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          
          <Grid item xs={12}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Grid key={item} container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Skeleton variant="text" />
                </Grid>
                <Grid item xs={6} container justifyContent="flex-end">
                  <Skeleton variant="text" width={60} />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default SkeletonPopularCard

