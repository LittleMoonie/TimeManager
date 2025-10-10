import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { formatWeekRange, getWeekStart } from './utils'


interface TimesheetHistory {
  id: string
  weekStartISO: string
  status: string
  weekTotal: number
  submittedAt: string
}

interface TimesheetHistoryPanelProps {
  open: boolean
  onClose: () => void
  history: TimesheetHistory[]
  onSelectWeek: (weekStartISO: string) => void
}

const statusColorMap: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  draft: 'default',
  sent: 'success',
  'attention-required': 'warning',
  approved: 'success',
  rejected: 'error',
}

export const TimesheetHistoryPanel = ({
  open,
  onClose,
  history,
  onSelectWeek,
}: TimesheetHistoryPanelProps) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 360 } }}>
      <Box p={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Timesheet history</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <Box p={2} sx={{ flexGrow: 1 }}>
        {history.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No past weeks available yet.
          </Typography>
        ) : (
          <List>
            {history.map(item => {
              const weekStart = getWeekStart(new Date(item.weekStartISO))
              const rangeLabel = formatWeekRange(weekStart)
              const statusColor = statusColorMap[item.status] ?? 'default'
              return (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      onSelectWeek(item.weekStartISO)
                      onClose()
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight={600}>
                            {rangeLabel}
                          </Typography>
                          <Chip label={item.status} size="small" color={statusColor} />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5} mt={1}>
                          <Typography variant="caption" color="text.secondary">
                            Total {Math.round(item.weekTotal / 60)}h {item.weekTotal % 60}m
                          </Typography>
                          {item.submittedAt && (
                            <Typography variant="caption" color="text.secondary">
                              Submitted{' '}
                              {new Date(item.submittedAt).toLocaleString(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        )}
      </Box>
    </Drawer>
  )
}

export default TimesheetHistoryPanel
