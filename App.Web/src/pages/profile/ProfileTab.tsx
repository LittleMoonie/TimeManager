import { Avatar, Box, Card, CardContent, Typography, Chip, Stack, Divider } from '@mui/material'
import { Email, Phone, LocationOn } from '@mui/icons-material'
import { useAuth } from '@/hooks/useAuth'

export const ProfileSummaryCard = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No user data available
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <Card>
      <CardContent>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Avatar src={user.avatarUrl} sx={{ width: 96, height: 96, fontSize: '2rem' }}>
            {initials}
          </Avatar>

          <Box>
            <Typography variant="h6">{fullName}</Typography>
            {user.roleTitle && (
              <Typography variant="body2" color="text.secondary">
                {user.roleTitle}
              </Typography>
            )}
            {user.companyName && (
              <Typography variant="body2" color="text.secondary">
                {user.companyName}
              </Typography>
            )}
          </Box>

          <Divider flexItem />

          <Box width="100%" textAlign="left">
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Contact
            </Typography>
            <Stack spacing={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>

              {user.companyPhone && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {user.companyPhone}
                  </Typography>
                </Box>
              )}

              {user.companyLocation && (
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {user.companyLocation}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          <Box width="100%" textAlign="left">
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Teams
            </Typography>
            {user.teams && user.teams.length > 0 ? (
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {user.teams.map((team, index) => (
                  <Chip key={index} label={team} size="small" variant="outlined" />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No teams
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
