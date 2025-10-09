import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import { RecognizedDevicesList } from './RecognizedDevicesList';
import { ActiveSessionsList } from './ActiveSessionsList';
import { ActiveSession, RecognizedDevice } from '@/types';

interface AdvancedSettingsTabProps {
  settings: {
    loginNotificationsEnabled: boolean;
    loginApprovalsRequired: boolean;
  };
  onToggle: (setting: keyof AdvancedSettingsTabProps['settings']) => void;
  feedbackMessage: string | null;
  devices: RecognizedDevice[];
  sessions: ActiveSession[];
  onRemoveDevice: (deviceId: string) => void;
  onLogoutSession: (sessionId: string) => void;
  onLogoutAllOthers: () => void;
}

export const AdvancedSettingsTab = ({
  settings,
  onToggle,
  feedbackMessage,
  devices,
  sessions,
  onRemoveDevice,
  onLogoutSession,
  onLogoutAllOthers,
}: AdvancedSettingsTabProps) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (feedbackMessage) {
      setSnackbarOpen(true);
    }
  }, [feedbackMessage]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  LOGIN NOTIFICATIONS
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.loginNotificationsEnabled}
                      onChange={() => onToggle('loginNotificationsEnabled')}
                    />
                  }
                  label="Email me when someone signs in to my account"
                />
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Updates save instantly.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  LOGIN APPROVALS
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.loginApprovalsRequired}
                      onChange={() => onToggle('loginApprovalsRequired')}
                    />
                  }
                  label="Require approval for logins from unrecognized devices"
                />
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Keep this on to block suspicious sign-ins.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <RecognizedDevicesList devices={devices} onRemoveDevice={onRemoveDevice} />
        <ActiveSessionsList
          sessions={sessions}
          onLogout={onLogoutSession}
          onLogoutAllOthers={onLogoutAllOthers}
        />
      </Stack>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
          {feedbackMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
