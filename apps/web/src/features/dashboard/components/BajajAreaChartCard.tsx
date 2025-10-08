import { Box, Card, CardContent, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

/**
 * Bajaj Area Chart Card Component
 * TODO: Implement actual chart from views/dashboard/Default/BajajAreaChartCard.js
 * For now, showing placeholder
 */
function BajajAreaChartCard() {
  const theme = useTheme()

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.primary.light,
            borderRadius: 1,
          }}
        >
          <Typography variant="body1" color="textSecondary">
            Bajaj Area Chart
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default BajajAreaChartCard

