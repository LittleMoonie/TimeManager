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
          <Grid>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid>
                <Skeleton variant="rectangular" width={44} height={44} />
              </Grid>
              <Grid>
                <Skeleton variant="rectangular" width={34} height={34} />
              </Grid>
            </Grid>
          </Grid>
          <Grid sx={{ mb: 0.75 }}>
            <Skeleton variant="text" sx={{ fontSize: '2.125rem' }} />
          </Grid>
          <Grid>
            <Skeleton variant="text" />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default SkeletonTotalIncomeCard

