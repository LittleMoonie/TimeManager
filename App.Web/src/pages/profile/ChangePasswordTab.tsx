import { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

export const ChangePasswordTab = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    // TODO: Implement password change API call
    console.log('Changing password...', formData);

    // Simulate success
    setTimeout(() => {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setStatus({
        type: 'success',
        message: 'Password changed successfully.',
      });
      setIsSubmitting(false);
    }, 400);
  };

  const handleCreateTicket = () => {
    const ticketData = {
      userId: user?.id,
      username: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      email: user?.email,
      subject: 'Password Change Request',
      description: 'User requesting assistance with password change',
    };
    
    console.log('Creating IT ticket:', ticketData);

    if (typeof window !== 'undefined') {
      const ticketUrl = new URL('/helpdesk/new-ticket', window.location.origin);
      ticketUrl.searchParams.set('userId', ticketData.userId ?? '');
      ticketUrl.searchParams.set('username', ticketData.username);
      ticketUrl.searchParams.set('email', ticketData.email ?? '');
      window.open(ticketUrl.toString(), '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Minimum 8 characters with a number and symbol. Keep your password private.
            </Typography>
          </Box>

          {status && (
            <Alert severity={status.type} onClose={() => setStatus(null)}>
              {status.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange('currentPassword')}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword}
                required
                autoComplete="current-password"
              />

              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange('newPassword')}
                error={!!errors.newPassword}
                helperText={errors.newPassword || 'Minimum 8 characters'}
                required
                autoComplete="new-password"
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                required
                autoComplete="new-password"
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleCreateTicket}
                  color="secondary"
                >
                  Create IT Ticket
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  Change Password
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
