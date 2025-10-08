import { useTheme } from '@mui/material/styles'
import { Avatar, Box, Grid, Typography } from '@mui/material'

// Project imports
import MainCard from '@/components/cards/MainCard'

// Assets
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

interface TotalIncomeDarkCardProps {
  isLoading?: boolean
}

/**
 * Total Income Dark Card Component
 * TODO: Complete conversion from views/dashboard/Default/TotalIncomeDarkCard.js
 */
function TotalIncomeDarkCard({ isLoading }: TotalIncomeDarkCardProps) {
  const theme = useTheme()

  return (
    <MainCard
      border={false}
      sx={{
        backgroundColor: theme.palette.success.dark,
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
        '&>div': {
          position: 'relative',
          zIndex: 5
        },
        '&:after': {
          content: '""',
          position: 'absolute',
          width: 210,
          height: 210,
          background: theme.palette.success[800],
          borderRadius: '50%',
          top: { xs: -105, sm: -85 },
          right: { xs: -140, sm: -95 }
        }
      }}
    >
      <Box sx={{ p: 2.25 }}>
        <Grid container direction="column">
          <Grid sx={{ mb: 0.75 }}>
            <Grid container alignItems="center">
              <Grid xs={6}>
                <Grid container alignItems="center">
                  <Grid>
                    <Typography
                      sx={{
                        fontSize: '2.125rem',
                        fontWeight: 500,
                        mr: 1,
                        mt: 1.75,
                        mb: 0.75
                      }}
                    >
                      $203k
                    </Typography>
                  </Grid>
                  <Grid>
                    <Avatar
                      sx={{
                        cursor: 'pointer',
                        ...theme.typography.smallAvatar,
                        backgroundColor: theme.palette.success[200],
                        color: theme.palette.success.dark
                      }}
                    >
                      <ArrowDownwardIcon fontSize="inherit" sx={{ transform: 'rotate3d(1, 1, 1, 45deg)' }} />
                    </Avatar>
                  </Grid>
                </Grid>
              </Grid>
              <Grid xs={6}>
                <Avatar
                  sx={{
                    ...theme.typography.commonAvatar,
                    ...theme.typography.largeAvatar,
                    backgroundColor: theme.palette.success[800],
                    color: '#fff',
                    mt: 1
                  }}
                >
                  <ArrowDownwardIcon fontSize="inherit" />
                </Avatar>
              </Grid>
            </Grid>
          </Grid>
          <Grid>
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 500,
                color: theme.palette.success[200]
              }}
            >
              Total Income
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  )
}

export default TotalIncomeDarkCard

