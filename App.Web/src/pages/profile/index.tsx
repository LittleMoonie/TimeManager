import { useEffect, useState } from 'react'
import { Box, Tabs, Tab, Grid, Stack } from '@mui/material'
import { PageHeader } from '@/components/ui/PageHeader'
import { AppBreadcrumbs } from '@/components/ui/Breadcrumbs'
import { ProfileSummaryCard } from './ProfileTab'
import { AdvancedSettingsTab } from './AdvancedSettingsTab'
import { ChangePasswordTab } from './ChangePasswordTab'
import { AboutMeSection } from './AboutMeSection'
import { RecognizedDevice, ActiveSession } from '@/types'

type TabValue = 'profile' | 'advanced' | 'password'

// Mock data - in real app, this would come from API
const mockRecognizedDevices: RecognizedDevice[] = [
  {
    id: '1',
    name: 'Cent Desktop',
    location: '4351 Deans Lane, Chelmsford',
    lastActive: new Date(Date.now() - 0).toISOString(),
    deviceType: 'desktop',
  },
  {
    id: '2',
    name: 'Imho Tablet',
    location: '4185 Michigan Avenue',
    lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    deviceType: 'tablet',
  },
  {
    id: '3',
    name: 'Albs Mobile',
    location: '3462 Fairfax Drive, Montcalm',
    lastActive: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    deviceType: 'mobile',
  },
]

const mockActiveSessions: ActiveSession[] = [
  {
    id: '1',
    name: 'Ceto Desktop',
    location: '4351 Deans Lane, Chelmsford',
    current: true,
    deviceType: 'desktop',
  },
  {
    id: '2',
    name: 'Moon Tablet',
    location: '4185 Michigan Avenue',
    current: false,
    deviceType: 'tablet',
  },
]

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('profile')
  const [recognizedDevices, setRecognizedDevices] = useState(mockRecognizedDevices)
  const [activeSessions, setActiveSessions] = useState(mockActiveSessions)
  const [securitySettings, setSecuritySettings] = useState({
    loginNotificationsEnabled: true,
    loginApprovalsRequired: false,
  })
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue)
  }

  const handleRemoveDevice = (deviceId: string) => {
    setRecognizedDevices(devices => devices.filter(device => device.id !== deviceId))
  }

  const handleLogoutSession = (sessionId: string) => {
    setActiveSessions(sessions => sessions.filter(session => session.id !== sessionId))
  }

  const handleLogoutAllOthers = () => {
    setActiveSessions(sessions => sessions.filter(session => session.current))
  }

  const handleSecurityToggle = (setting: keyof typeof securitySettings) => {
    setSecuritySettings(prev => {
      const next = { ...prev, [setting]: !prev[setting] }
      return next
    })

    setFeedbackMessage(
      setting === 'loginNotificationsEnabled'
        ? 'Login notifications preference saved.'
        : 'Login approvals preference saved.'
    )
  }

  useEffect(() => {
    if (!feedbackMessage) return

    const timeout = setTimeout(() => {
      setFeedbackMessage(null)
    }, 2600)

    return () => clearTimeout(timeout)
  }, [feedbackMessage])

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Stack spacing={3}>
        <AppBreadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Account', href: '/account' },
            { label: 'Profile' },
          ]}
        />

        <PageHeader title="Profile" />

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab label="Profile" value="profile" />
          <Tab label="Advanced Settings" value="advanced" />
          <Tab label="Change Password" value="password" />
        </Tabs>

        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 4 }}>
            <ProfileSummaryCard />
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            {activeTab === 'profile' && <AboutMeSection />}

            {activeTab === 'advanced' && (
              <AdvancedSettingsTab
                settings={securitySettings}
                onToggle={handleSecurityToggle}
                feedbackMessage={feedbackMessage}
                devices={recognizedDevices}
                sessions={activeSessions}
                onRemoveDevice={handleRemoveDevice}
                onLogoutSession={handleLogoutSession}
                onLogoutAllOthers={handleLogoutAllOthers}
              />
            )}

            {activeTab === 'password' && <ChangePasswordTab />}
          </Grid>
        </Grid>
      </Stack>
    </Box>
  )
}

export default ProfilePage
