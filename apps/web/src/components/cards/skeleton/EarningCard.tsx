import { Card, CardContent, Grid, Skeleton } from '@mui/material'

/**
 * Skeleton placeholder for EarningCard
 * Converted from ui-component/cards/Skeleton/EarningCard.js
 */
function SkeletonEarningCard() {
  return (
    <Card>
      <CardContent>
        <Grid container direction="column">
          <Grid item>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Skeleton variant="rectangular" width={44} height={44} />
              </Grid>
              <Grid item>
                <Skeleton variant="rectangular" width={34} height={34} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Skeleton variant="text" sx={{ fontSize: '2.125rem' }} />
          </Grid>
          <Grid item>
            <Skeleton variant="text" />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default SkeletonEarningCard

