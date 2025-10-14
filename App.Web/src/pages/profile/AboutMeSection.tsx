import { Edit, Save, Cancel } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';

export const AboutMeSection = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [aboutMe, setAboutMe] = useState(user?.aboutMe || '');

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // TODO: Implement save functionality with API call
    console.log('Saving about me:', aboutMe);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setAboutMe(user?.aboutMe || '');
    setIsEditing(false);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">About me</Typography>
          {!isEditing && (
            <IconButton size="small" onClick={handleEdit}>
              <Edit fontSize="small" />
            </IconButton>
          )}
        </Box>

        {isEditing ? (
          <Box>
            <TextField
              multiline
              rows={4}
              fullWidth
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Tell us about yourself..."
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" size="small" startIcon={<Save />} onClick={handleSave}>
                Save
              </Button>
              <Button variant="outlined" size="small" startIcon={<Cancel />} onClick={handleCancel}>
                Cancel
              </Button>
            </Stack>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {user?.aboutMe || 'User has no about me.'}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
