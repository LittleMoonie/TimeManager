import { Box, Tabs, Tab, Grid, Stack } from '@mui/material';
import { useEffect, useState } from 'react';

import { AppBreadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageHeader } from '@/components/ui/PageHeader';

import { AboutMeSection } from './AboutMeSection';
import { AdvancedSettingsTab } from '../../components/profile/AdvancedSettingsTab';
import { ChangePasswordTab } from '../../components/profile/ChangePasswordTab';
import { ProfileSummaryCard } from '../../components/profile/ProfileTab';

type TabValue = 'profile' | 'advanced' | 'password';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('profile');
  const [securitySettings, setSecuritySettings] = useState({
    loginNotificationsEnabled: true,
    loginApprovalsRequired: false,
  });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  const handleSecurityToggle = (setting: keyof typeof securitySettings) => {
    setSecuritySettings((prev) => {
      const next = { ...prev, [setting]: !prev[setting] };
      return next;
    });

    setFeedbackMessage(
      setting === 'loginNotificationsEnabled'
        ? 'Login notifications preference saved.'
        : 'Login approvals preference saved.',
    );
  };

  useEffect(() => {
    if (!feedbackMessage) return;

    const timeout = setTimeout(() => {
      setFeedbackMessage(null);
    }, 2600);

    return () => clearTimeout(timeout);
  }, [feedbackMessage]);

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
                devices={[]}
                sessions={[]}
                onRemoveDevice={() => {}}
                onLogoutSession={() => {}}
                onLogoutAllOthers={() => {}}
              />
            )}

            {activeTab === 'password' && <ChangePasswordTab />}
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default ProfilePage;
