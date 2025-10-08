import { Card, CardContent, Grid, Skeleton } from '@mui/material'

/**
 * Total Income Card Skeleton Component
 * TODO: Complete conversion from ui-component/cards/Skeleton/TotalIncomeCard.js
 */
function SkeletonTotalIncomeCard() {
  return (
    <Card>
      <CardContent>
        <Grid container direction="column">
          <Grid item>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Skeleton variant="rectangular" width={44} height={44} />
              </Grid>
              <Grid item>
                <Skeleton variant="rectangular" width={34} height={34} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item sx={{ mb: 0.75 }}>
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

export default SkeletonTotalIncomeCard

