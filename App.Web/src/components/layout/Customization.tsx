import { useState } from 'react'
import {
  Fab,
  Drawer,
  Box,
  Typography,
  IconButton,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
} from '@mui/material'
import { IconSettings, IconX } from '@tabler/icons-react'
import { useSelector } from 'react-redux'
import { useTheme } from '@/hooks/useTheme'
import type { RootState } from '@/lib/store/types'

/**
 * Theme customization panel
 * TODO: Migrate from layout/Customization/index.tsx
 */
function Customization() {
  const [open, setOpen] = useState(false)
  const { customization, changeBorderRadius, changeNavType } = useTheme()

  const handleToggle = () => {
    setOpen(!open)
  }

  const handleBorderRadiusChange = (_event: Event, newValue: number | number[]) => {
    changeBorderRadius(newValue as number)
  }

  const handleNavTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    changeNavType(event.target.value as 'light' | 'dark')
  }

  return (
    <>
      {/* Settings FAB */}
      <Fab
        component="div"
        onClick={handleToggle}
        size="medium"
        variant="circular"
        color="secondary"
        sx={{
          borderRadius: 0,
          borderTopLeftRadius: '50%',
          borderBottomLeftRadius: '50%',
          borderTopRightRadius: '50%',
          borderBottomRightRadius: '4px',
          top: '25%',
          position: 'fixed',
          right: 10,
          zIndex: 1200,
        }}
      >
        <IconSettings size={20} />
      </Fab>

      {/* Customization Panel */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            p: 2,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Theme Customization</Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <IconX size={20} />
          </IconButton>
        </Box>

        {/* Border Radius */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Border Radius: {customization.borderRadius}px
          </Typography>
          <Slider
            value={customization.borderRadius}
            onChange={handleBorderRadiusChange}
            min={4}
            max={24}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        {/* Navigation Type */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Navigation Type
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={customization.navType}
              onChange={handleNavTypeChange}
            >
              <FormControlLabel
                value="light"
                control={<Radio size="small" />}
                label="Light"
              />
              <FormControlLabel
                value="dark"
                control={<Radio size="small" />}
                label="Dark"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Typography variant="caption" color="textSecondary">
          More customization options coming soon...
        </Typography>
      </Drawer>
    </>
  )
}

export default Customization

