import { Box, Typography, Stack, Button, Card, CardContent, Divider, Chip } from '@mui/material'
import { Computer, PhoneAndroid, Tablet } from '@mui/icons-material'
import { ActiveSession } from '@/types'

interface ActiveSessionsListProps {
  sessions: ActiveSession[]
  onLogout: (sessionId: string) => void
  onLogoutAllOthers: () => void
}

const getDeviceIcon = (deviceType: ActiveSession['deviceType']) => {
  switch (deviceType) {
    case 'desktop':
      return <Computer fontSize="small" />
    case 'mobile':
      return <PhoneAndroid fontSize="small" />
    case 'tablet':
      return <Tablet fontSize="small" />
    default:
      return <Computer fontSize="small" />
  }
}

export const ActiveSessionsList = ({
  sessions,
  onLogout,
  onLogoutAllOthers,
}: ActiveSessionsListProps) => {
  const currentSession = sessions.find(session => session.current)
  const otherSessions = sessions.filter(session => !session.current)

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">ACTIVE SESSIONS</Typography>
            <Typography variant="caption" color="text.secondary">
              Sessions currently using your account
            </Typography>
          </Box>

          {sessions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No active sessions.
            </Typography>
          ) : (
            <Stack spacing={2} divider={<Divider flexItem />} sx={{ mt: 1 }}>
              {currentSession && (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={2}
                  flexWrap="wrap"
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    {getDeviceIcon(currentSession.deviceType)}
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {currentSession.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {currentSession.location}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label="Current session" size="small" color="success" />
                </Box>
              )}

              {otherSessions.map(session => (
                <Box
                  key={session.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={2}
                  flexWrap="wrap"
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    {getDeviceIcon(session.deviceType)}
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {session.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {session.location}
                      </Typography>
                    </Box>
                  </Box>

                  <Button size="small" color="error" onClick={() => onLogout(session.id)}>
                    Log out
                  </Button>
                </Box>
              ))}
            </Stack>
          )}

          {otherSessions.length > 0 && (
            <Box display="flex" justifyContent="flex-end">
              <Button size="small" color="error" onClick={onLogoutAllOthers}>
                Log out of all other sessions
              </Button>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
