import { useTheme } from '@mui/material/styles'
import { Avatar, Box, Grid, Typography } from '@mui/material'

// Project imports
import MainCard from '@/components/cards/MainCard'

// Assets
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'

interface TotalIncomeLightCardProps {
  isLoading?: boolean
}

/**
 * Total Income Light Card Component
 * TODO: Complete conversion from views/dashboard/Default/TotalIncomeLightCard.js
 */
function TotalIncomeLightCard({ isLoading }: TotalIncomeLightCardProps) {
  const theme = useTheme()

  return (
    <MainCard
      border={false}
      sx={{
        backgroundColor: theme.palette.primary[800],
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          width: 210,
          height: 210,
          background: theme.palette.primary[200],
          borderRadius: '50%',
          zIndex: 1,
          top: { xs: -105, sm: -85 },
          right: { xs: -140, sm: -95 }
        },
        '&:before': {
          content: '""',
          position: 'absolute',
          zIndex: 1,
          width: 210,
          height: 210,
          background: theme.palette.primary[200],
          borderRadius: '50%',
          top: { xs: -155, sm: -125 },
          right: { xs: -70, sm: -15 },
          opacity: 0.5
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
                        backgroundColor: theme.palette.primary[200],
                        color: theme.palette.primary.dark
                      }}
                    >
                      <ArrowUpwardIcon fontSize="inherit" sx={{ transform: 'rotate3d(1, 1, 1, 45deg)' }} />
                    </Avatar>
                  </Grid>
                  <Grid xs={12}>
                    <Typography
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: theme.palette.primary[200]
                      }}
                    >
                      Total Income
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid xs={6}>
                <Avatar
                  sx={{
                    ...theme.typography.commonAvatar,
                    ...theme.typography.largeAvatar,
                    backgroundColor: theme.palette.primary[200],
                    border: '1px solid',
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.dark,
                    zIndex: 1
                  }}
                >
                  <ArrowUpwardIcon fontSize="inherit" />
                </Avatar>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  )
}

export default TotalIncomeLightCard

