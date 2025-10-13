import { useMemo, useState } from 'react';
import {
  ButtonBase,
  Box,
  Chip,
  Divider,
  Fab,
  Popover,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { SettingsRounded } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { useThemeController, type ThemePreset } from '@/themes';

const getPresetGradient = (preset: ThemePreset) => {
  const primary = preset.palette.primary as { light?: string; main?: string } | undefined;
  const secondary = preset.palette.secondary as { main?: string } | undefined;
  const start = primary?.light ?? primary?.main ?? secondary?.main ?? '#1976d2';
  const end = secondary?.main ?? primary?.main ?? start;
  return `linear-gradient(135deg, ${start}, ${end})`;
};

export const SettingsFab = () => {
  const {
    themeId,
    setThemeId,
    availableThemes,
    currentPreset,
    mode,
    setMode,
    toggleMode,
    selectNextTheme,
    density,
    setDensity,
  } = useThemeController();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);
  const focusRing = useMemo(
    () => `0 0 0 3px ${alpha(theme.palette.primary.main, mode === 'light' ? 0.28 : 0.42)}`,
    [mode, theme.palette.primary.main],
  );

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
            right: 24,
            bottom: 24,
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
            width: 320,
            boxShadow: (themeArg) => themeArg.shadows[4],
          },
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Theme palette
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              {availableThemes.map((preset) => {
                const selected = preset.id === themeId;
                const gradient = getPresetGradient(preset);
                const primaryMain =
                  (preset.palette.primary as { main?: string })?.main ?? theme.palette.primary.main;
                return (
                  <ButtonBase
                    key={preset.id}
                    onClick={() => setThemeId(preset.id)}
                    focusRipple
                    sx={{
                      width: 'calc(50% - 6px)',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: (themeArg) =>
                        `1px solid ${
                          selected
                            ? themeArg.palette.primary.main
                            : alpha(
                                themeArg.palette.divider,
                                themeArg.palette.mode === 'light' ? 1 : 0.6,
                              )
                        }`,
                      boxShadow: selected ? theme.shadows[3] : 'none',
                      transform: selected ? 'translateY(-2px)' : 'none',
                      transition: 'all 120ms ease',
                      '&:focus-visible': {
                        outline: 'none',
                        boxShadow: focusRing,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        alignItems: 'flex-start',
                        background: gradient,
                        color: theme.palette.getContrastText(primaryMain),
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={700}>
                        {preset.label}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {preset.mode === 'light' ? 'Light' : 'Dark'} &bull;{' '}
                        {preset.group.toUpperCase()}
                      </Typography>
                    </Box>
                  </ButtonBase>
                );
              })}
            </Stack>
            <Chip
              label={`Active: ${currentPreset.label}`}
              size="small"
              sx={{ mt: 1.5, alignSelf: 'flex-start' }}
            />
          </Box>

          <Divider flexItem />

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
              Quick actions
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <ToggleButton value="toggle-mode" selected={false} onClick={toggleMode} size="small">
                Toggle mode
              </ToggleButton>
              <ToggleButton
                value="cycle-theme"
                selected={false}
                onClick={() => selectNextTheme(1)}
                size="small"
              >
                Next theme
              </ToggleButton>
            </Stack>
          </Box>
        </Stack>
      </Popover>
    </>
  );
};

export default SettingsFab;
