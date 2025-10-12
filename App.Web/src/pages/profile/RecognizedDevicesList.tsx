import { Box, Typography, Stack, IconButton, Card, CardContent, Divider } from '@mui/material'
import { Computer, PhoneAndroid, Tablet, Close } from '@mui/icons-material'
import { RecognizedDevice } from '@/types'

interface RecognizedDevicesListProps {
  devices: RecognizedDevice[]
  onRemoveDevice: (deviceId: string) => void
}

const getDeviceIcon = (deviceType: RecognizedDevice['deviceType']) => {
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

const getLastActiveLabel = (lastActive: string) => {
  const diffMs = Date.now() - new Date(lastActive).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (days <= 0) return 'Last active today'
  if (days === 1) return 'Last active 1 day ago'
  if (days < 7) return `Last active ${days} days ago`

  const weeks = Math.floor(days / 7)
  if (weeks === 1) return 'Last active 1 week ago'
  if (weeks < 5) return `Last active ${weeks} weeks ago`

  const months = Math.floor(days / 30)
  if (months === 1) return 'Last active 1 month ago'
  return `Last active ${months} months ago`
}

export const RecognizedDevicesList = ({ devices, onRemoveDevice }: RecognizedDevicesListProps) => {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">RECOGNIZED DEVICES</Typography>
            <Typography variant="caption" color="text.secondary">
              Devices that can sign in without approvals
            </Typography>
          </Box>

          {devices.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No recognized devices.
            </Typography>
          ) : (
            <Stack spacing={2} divider={<Divider flexItem />} sx={{ mt: 1 }}>
              {devices.map(device => (
                <Box
                  key={device.id}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                  flexWrap="wrap"
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    {getDeviceIcon(device.deviceType)}
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {device.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {device.location}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getLastActiveLabel(device.lastActive)}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton size="small" onClick={() => onRemoveDevice(device.id)} color="error">
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
