import { useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  Fab,
  IconButton,
  Popover,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { SettingsRounded } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useThemeController, primarySwatches, type PrimaryColor } from '@/themes';

const PRIMARY_OPTIONS: { key: PrimaryColor; label: string }[] = [
  { key: 'purple', label: 'Berry Purple' },
  { key: 'blue', label: 'Berry Blue' },
  { key: 'teal', label: 'Teal' },
];

export const SettingsFab = () => {
  const { mode, setMode, toggleMode, density, setDensity, primaryColor, setPrimaryColor } = useThemeController();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Theme settings" placement="left">
        <Fab
          color="primary"
          size="medium"
          onClick={handleOpen}
          aria-label="Open appearance settings"
          sx={{
            position: 'fixed',
            right: { xs: 16, md: 32 },
            bottom: { xs: 24, md: 36 },
            zIndex: (theme) => theme.zIndex.tooltip + 1,
            boxShadow: (theme) => theme.shadows[4],
          }}
        >
          <SettingsRounded />
        </Fab>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{
          elevation: 0,
          sx: {
            p: 2.5,
            borderRadius: 3,
            width: 280,
            boxShadow: '0px 14px 40px rgba(15, 23, 42, 0.14)',
          },
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Theme mode
            </Typography>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, value) => value && setMode(value)}
              size="small"
              aria-label="Toggle light or dark theme"
            >
              <ToggleButton value="light">Light</ToggleButton>
              <ToggleButton value="dark">Dark</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider flexItem />

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Density
            </Typography>
            <ToggleButtonGroup
              value={density}
              exclusive
              onChange={(_, value) => value && setDensity(value)}
              size="small"
              aria-label="Adjust interface density"
            >
              <ToggleButton value="comfortable">Comfortable</ToggleButton>
              <ToggleButton value="compact">Compact</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider flexItem />

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Primary accent
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {PRIMARY_OPTIONS.map((option) => {
                const swatch = primarySwatches[option.key];
                const selected = option.key === primaryColor;
                return (
                  <Tooltip key={option.key} title={option.label} placement="top">
                    <IconButton
                      aria-label={`Set primary color to ${option.label}`}
                      onClick={() => setPrimaryColor(option.key)}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2.5,
                        border: (theme) => `1px solid ${alpha(theme.palette.grey[400], 0.4)}`,
                        background: `linear-gradient(135deg, ${alpha(swatch.light, 0.9)}, ${swatch.dark})`,
                        boxShadow: selected ? '0px 6px 16px rgba(15, 23, 42, 0.18)' : 'none',
                        transform: selected ? 'translateY(-2px)' : 'none',
                        transition: 'all 120ms ease',
                        '&:focus-visible': {
                          outline: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                          outlineOffset: 2,
                        },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Stack>
            <Chip
              label={`Current: ${PRIMARY_OPTIONS.find((option) => option.key === primaryColor)?.label ?? ''}`}
              size="small"
              sx={{ mt: 1.5, alignSelf: 'flex-start' }}
            />
          </Box>

          <Divider flexItem />

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Quick actions
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <ToggleButton value="toggle-mode" selected={false} onClick={toggleMode} size="small">
                Toggle mode
              </ToggleButton>
            </Stack>
          </Box>
        </Stack>
      </Popover>
    </>
  );
};

export default SettingsFab;
